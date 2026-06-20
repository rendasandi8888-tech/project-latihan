// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IUserRegistry.sol";

/**
 * @title AuditTrail
 * @notice Contract ketiga yang di-deploy. Mencatat semua aktivitas di sistem MediChain
 *         secara immutable di blockchain. Setiap aksi menghasilkan satu entry audit log.
 * @dev Membutuhkan address UserRegistry dan MedicalRecord di constructor.
 *      Semua entry bersifat append-only — tidak ada fungsi delete atau update.
 */
contract AuditTrail {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct AuditEntry {
        uint256 id;              // ID entry (auto-increment mulai dari 1)
        string action;           // Jenis aksi: UPLOAD, DOWNLOAD, GRANT_ACCESS, REVOKE_ACCESS, LOGIN, VIEW
        address performedBy;     // Wallet yang melakukan aksi
        uint256 targetRecordId;  // ID record terkait (0 jika tidak ada)
        address targetUser;      // Wallet user terkait (address(0) jika tidak ada)
        uint256 timestamp;       // Unix timestamp saat aksi dilakukan
        string department;       // Departemen pemanggil
        string details;          // Detail tambahan dalam format string JSON atau plaintext
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    /// @notice Mapping dari entry ID ke data AuditEntry
    mapping(uint256 => AuditEntry) public auditLog;

    /// @notice Mapping wallet address ke list entry ID (log per user)
    mapping(address => uint256[]) public userAuditLog;

    /// @notice Mapping record ID ke list entry ID (log per record)
    mapping(uint256 => uint256[]) public recordAuditLog;

    /// @notice Total jumlah entry audit log
    uint256 public totalEntries;

    /// @notice Address contract MedicalRecord (boleh log tanpa role check)
    address public medicalRecordContract;

    /// @notice Reference ke UserRegistry untuk ambil data user
    IUserRegistry public userRegistry;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted setiap kali ada aksi yang dicatat
    event ActionLogged(
        uint256 indexed entryId,
        string action,
        address indexed performedBy,
        uint256 indexed targetRecordId,
        uint256 timestamp
    );

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @notice Constructor — simpan referensi ke UserRegistry dan MedicalRecord
     * @param _userRegistry Address contract UserRegistry
     * @param _medicalRecord Address contract MedicalRecord
     */
    constructor(address _userRegistry, address _medicalRecord) {
        require(_userRegistry != address(0), "AuditTrail: Invalid UserRegistry address");
        require(_medicalRecord != address(0), "AuditTrail: Invalid MedicalRecord address");
        userRegistry = IUserRegistry(_userRegistry);
        medicalRecordContract = _medicalRecord;
    }

    // ─── Write Functions ──────────────────────────────────────────────────────

    /**
     * @notice Catat aksi ke audit log
     * @dev Bisa dipanggil oleh:
     *      1. User yang terdaftar (bukan UNREGISTERED) untuk log aktivitas mereka sendiri
     *      2. Contract MedicalRecord untuk auto-log saat operasi
     *      Entry bersifat immutable — tidak ada fungsi edit atau delete.
     * @param action Jenis aksi: "UPLOAD", "DOWNLOAD", "GRANT_ACCESS", "REVOKE_ACCESS", "LOGIN", "VIEW"
     * @param targetRecordId ID record terkait (kirim 0 jika tidak ada)
     * @param targetUser Address user terkait (kirim address(0) jika tidak ada)
     * @param details Informasi tambahan (JSON string atau plaintext)
     * @return entryId ID entry yang baru dibuat
     */
    function logAction(
        string calldata action,
        uint256 targetRecordId,
        address targetUser,
        string calldata details
    ) external returns (uint256 entryId) {
        // Validasi: hanya user terdaftar atau MedicalRecord contract yang bisa log
        bool isRegisteredUser = userRegistry.getRole(msg.sender) != IUserRegistry.Role.UNREGISTERED;
        bool isMedicalRecordContract = msg.sender == medicalRecordContract;

        require(
            isRegisteredUser || isMedicalRecordContract,
            "AuditTrail: Caller is not registered or authorized contract"
        );

        // Ambil departemen pemanggil
        string memory department = _getDepartment(msg.sender);

        // Auto-increment entry ID (mulai dari 1)
        entryId = ++totalEntries;

        // Simpan entry
        auditLog[entryId] = AuditEntry({
            id: entryId,
            action: action,
            performedBy: msg.sender,
            targetRecordId: targetRecordId,
            targetUser: targetUser,
            timestamp: block.timestamp,
            department: department,
            details: details
        });

        // Update index per user
        userAuditLog[msg.sender].push(entryId);

        // Update index per record (jika ada record ID)
        if (targetRecordId > 0) {
            recordAuditLog[targetRecordId].push(entryId);
        }

        emit ActionLogged(entryId, action, msg.sender, targetRecordId, block.timestamp);

        return entryId;
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    /**
     * @notice Ambil audit log dengan pagination
     * @dev Hanya ADMIN yang bisa mengakses seluruh log.
     * @param from Index awal (1-based, inklusif)
     * @param to Index akhir (1-based, inklusif)
     * @return entries Array of AuditEntry dalam range yang diminta
     */
    function getAuditLog(
        uint256 from,
        uint256 to
    ) external view returns (AuditEntry[] memory entries) {
        require(
            userRegistry.getRole(msg.sender) == IUserRegistry.Role.ADMIN,
            "AuditTrail: Only admins can view full audit log"
        );
        require(from >= 1, "AuditTrail: from must be >= 1");
        require(to >= from, "AuditTrail: to must be >= from");
        require(to <= totalEntries, "AuditTrail: to exceeds total entries");

        uint256 count = to - from + 1;
        entries = new AuditEntry[](count);

        for (uint256 i = 0; i < count; i++) {
            entries[i] = auditLog[from + i];
        }

        return entries;
    }

    /**
     * @notice Ambil semua entry ID dari log seorang user
     * @dev ADMIN bisa akses log siapa saja. User hanya bisa akses log dirinya sendiri.
     * @param userAddress Wallet address yang dicari log-nya
     * @return Array of entry IDs
     */
    function getUserAuditLog(
        address userAddress
    ) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);

        require(
            msg.sender == userAddress ||
            callerRole == IUserRegistry.Role.ADMIN,
            "AuditTrail: Access denied to user audit log"
        );

        return userAuditLog[userAddress];
    }

    /**
     * @notice Ambil semua entry ID dari log suatu record
     * @dev Hanya yang punya akses ke record atau ADMIN yang bisa akses.
     *      Karena AuditTrail tidak referensikan MedicalRecord contract secara langsung
     *      untuk menghindari circular dependency, semua caller yang terdaftar bisa akses.
     * @param recordId ID record
     * @return Array of entry IDs
     */
    function getRecordAuditLog(
        uint256 recordId
    ) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);

        require(
            callerRole != IUserRegistry.Role.UNREGISTERED,
            "AuditTrail: Caller is not registered"
        );

        return recordAuditLog[recordId];
    }

    /**
     * @notice Ambil satu entry audit berdasarkan ID
     * @dev Hanya ADMIN atau user yang terlibat dalam entry tersebut yang bisa akses.
     * @param entryId ID entry yang dicari
     * @return AuditEntry struct
     */
    function getEntry(uint256 entryId) external view returns (AuditEntry memory) {
        require(entryId >= 1 && entryId <= totalEntries, "AuditTrail: Invalid entry ID");

        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        AuditEntry memory entry = auditLog[entryId];

        require(
            callerRole == IUserRegistry.Role.ADMIN ||
            msg.sender == entry.performedBy ||
            msg.sender == entry.targetUser,
            "AuditTrail: Access denied to this entry"
        );

        return entry;
    }

    /**
     * @notice Ambil total jumlah entry dalam audit log
     * @return Total entries (uint256)
     */
    function getTotalEntries() external view returns (uint256) {
        return totalEntries;
    }

    /**
     * @notice Ambil N entry terbaru dari audit log (untuk dashboard)
     * @dev Hanya ADMIN yang bisa mengakses.
     * @param count Jumlah entry yang diminta (dari yang terbaru)
     * @return entries Array of AuditEntry terbaru
     */
    function getLatestEntries(
        uint256 count
    ) external view returns (AuditEntry[] memory entries) {
        require(
            userRegistry.getRole(msg.sender) == IUserRegistry.Role.ADMIN,
            "AuditTrail: Only admins can view latest entries"
        );

        if (count > totalEntries) {
            count = totalEntries;
        }

        entries = new AuditEntry[](count);
        uint256 startId = totalEntries - count + 1;

        for (uint256 i = 0; i < count; i++) {
            entries[i] = auditLog[startId + i];
        }

        return entries;
    }

    // ─── Internal Functions ───────────────────────────────────────────────────

    /**
     * @dev Ambil departemen user dari UserRegistry
     *      Jika address adalah MedicalRecord contract, return "System"
     */
    function _getDepartment(address userAddress) internal view returns (string memory) {
        if (userAddress == medicalRecordContract) {
            return "System";
        }

        try userRegistry.getUser(userAddress) returns (
            address,
            IUserRegistry.Role,
            string memory,
            string memory department,
            uint256,
            bool,
            address
        ) {
            return department;
        } catch {
            return "Unknown";
        }
    }
}
