// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IUserRegistry.sol";

/**
 * @title MedicalRecord
 * @notice Contract kedua yang di-deploy. Menyimpan metadata rekam medis radiologi.
 *         File DICOM terenkripsi dan key envelope disimpan di IPFS — hanya CID-nya di sini.
 * @dev Membutuhkan address UserRegistry di constructor.
 *      Data sensitif pasien (nama, NIK, tanggal lahir) sudah dienkripsi NJCS sebelum disimpan.
 */
contract MedicalRecord {

    // ─── Structs ──────────────────────────────────────────────────────────────

    /// @notice Parameter input untuk function uploadRecord — menghindari "Stack too deep"
    struct UploadRecordParams {
        address patientAddress;
        string encryptedPatientName;
        string encryptedPatientId;
        string encryptedBirthDate;
        string modality;
        string bodyPart;
        uint256 studyDate;
        string department;
        string dicomCID;
        string keyEnvelopeCID;
        string fileHash;
    }

    struct Record {
        uint256 id;                       // ID unik record (auto-increment)
        address patientAddress;           // wallet address pasien
        string encryptedPatientName;      // nama pasien terenkripsi NJCS
        string encryptedPatientId;        // NIK/ID pasien terenkripsi NJCS
        string encryptedBirthDate;        // tanggal lahir terenkripsi NJCS
        string modality;                  // CT atau XRAY (tidak dienkripsi, dibutuhkan query)
        string bodyPart;                  // bagian tubuh (tidak dienkripsi)
        uint256 studyDate;                // tanggal pemeriksaan (Unix timestamp)
        string department;                // departemen radiologi
        address uploadedBy;               // wallet petugas/dokter yang upload
        string dicomCID;                  // IPFS CID file DICOM terenkripsi
        string keyEnvelopeCID;            // IPFS CID key envelope (berisi NJCS params + AES IV)
        string fileHash;                  // SHA-256 hash file DICOM asli untuk verifikasi integritas
        uint256 uploadedAt;               // timestamp saat upload ke blockchain
        bool isActive;                    // false jika record dihapus/dinonaktifkan
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    /// @notice Mapping dari record ID ke data Record
    mapping(uint256 => Record) public records;

    /// @notice Mapping wallet pasien ke list record ID miliknya
    mapping(address => uint256[]) public patientRecords;

    /// @notice Mapping nama departemen ke list record ID di departemen tersebut
    mapping(string => uint256[]) public departmentRecords;

    /// @notice Mapping record ID → wallet address → boolean akses
    mapping(uint256 => mapping(address => bool)) public recordAccess;

    /// @notice Total jumlah record yang tersimpan
    uint256 public totalRecords;

    /// @notice Reference ke UserRegistry contract untuk validasi role
    IUserRegistry public userRegistry;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted saat rekam medis baru berhasil diupload
    event RecordUploaded(
        uint256 indexed recordId,
        address indexed uploadedBy,
        address indexed patientAddress,
        string department,
        uint256 timestamp
    );

    /// @notice Emitted saat akses diberikan ke dokter tertentu
    event AccessGranted(
        uint256 indexed recordId,
        address indexed grantedTo,
        address indexed grantedBy,
        uint256 timestamp
    );

    /// @notice Emitted saat akses dicabut dari dokter tertentu
    event AccessRevoked(
        uint256 indexed recordId,
        address indexed revokedFrom,
        address indexed revokedBy,
        uint256 timestamp
    );

    /// @notice Emitted saat record berhasil diverifikasi
    event RecordVerified(
        uint256 indexed recordId,
        address indexed verifiedBy,
        bool isValid,
        uint256 timestamp
    );

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @notice Constructor — simpan reference ke UserRegistry
     * @param _userRegistry Address dari contract UserRegistry yang sudah di-deploy
     */
    constructor(address _userRegistry) {
        require(_userRegistry != address(0), "MedicalRecord: Invalid UserRegistry address");
        userRegistry = IUserRegistry(_userRegistry);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    /**
     * @notice Hanya STAFF atau DOCTOR aktif yang boleh upload
     */
    modifier onlyStaffOrDoctor() {
        IUserRegistry.Role role = userRegistry.getRole(msg.sender);
        require(
            role == IUserRegistry.Role.STAFF || role == IUserRegistry.Role.DOCTOR || role == IUserRegistry.Role.ADMIN,
            "MedicalRecord: Caller must be Staff, Doctor, or Admin"
        );
        _;
    }

    /**
     * @notice Hanya ADMIN yang boleh memanggil
     */
    modifier onlyAdmin() {
        require(
            userRegistry.getRole(msg.sender) == IUserRegistry.Role.ADMIN,
            "MedicalRecord: Caller is not an admin"
        );
        _;
    }

    /**
     * @notice Hanya yang punya akses ke record ini yang boleh akses
     * @param recordId ID record yang dicek
     */
    modifier onlyWithAccess(uint256 recordId) {
        require(
            _hasAccess(recordId, msg.sender),
            "MedicalRecord: Access denied to this record"
        );
        _;
    }

    // ─── Write Functions ──────────────────────────────────────────────────────

    /**
     * @notice Upload rekam medis baru ke blockchain
     * @dev Hanya STAFF, DOCTOR, atau ADMIN yang bisa upload.
     *      Data sensitif pasien HARUS sudah dienkripsi NJCS sebelum dipanggil.
     *      Pemanggil otomatis mendapat akses ke record yang diupload.
     *      Pasien juga otomatis mendapat akses ke recordnya sendiri.
     * @param params Struct berisi semua parameter upload (menghindari stack too deep)
     * @return recordId ID record yang baru dibuat
     */
    function uploadRecord(
        UploadRecordParams calldata params
    ) external onlyStaffOrDoctor returns (uint256 recordId) {
        require(params.patientAddress != address(0), "MedicalRecord: Invalid patient address");
        require(bytes(params.dicomCID).length > 0, "MedicalRecord: DICOM CID cannot be empty");
        require(bytes(params.keyEnvelopeCID).length > 0, "MedicalRecord: Key envelope CID cannot be empty");
        require(bytes(params.fileHash).length > 0, "MedicalRecord: File hash cannot be empty");
        require(
            keccak256(bytes(params.modality)) == keccak256(bytes("CT")) ||
            keccak256(bytes(params.modality)) == keccak256(bytes("XRAY")),
            "MedicalRecord: Invalid modality, must be CT or XRAY"
        );

        // Auto-increment record ID (mulai dari 1)
        recordId = ++totalRecords;

        // Simpan record ke mapping
        records[recordId] = Record({
            id: recordId,
            patientAddress: params.patientAddress,
            encryptedPatientName: params.encryptedPatientName,
            encryptedPatientId: params.encryptedPatientId,
            encryptedBirthDate: params.encryptedBirthDate,
            modality: params.modality,
            bodyPart: params.bodyPart,
            studyDate: params.studyDate,
            department: params.department,
            uploadedBy: msg.sender,
            dicomCID: params.dicomCID,
            keyEnvelopeCID: params.keyEnvelopeCID,
            fileHash: params.fileHash,
            uploadedAt: block.timestamp,
            isActive: true
        });

        // Tambahkan ke list record pasien
        patientRecords[params.patientAddress].push(recordId);

        // Tambahkan ke list record departemen
        departmentRecords[params.department].push(recordId);

        // Grant akses ke uploader
        recordAccess[recordId][msg.sender] = true;

        // Grant akses ke pasien sendiri
        recordAccess[recordId][params.patientAddress] = true;

        // Grant akses ke semua dokter di departemen terkait
        address[] memory doctors = userRegistry.getDepartmentDoctors(params.department);
        for (uint256 i = 0; i < doctors.length; i++) {
            recordAccess[recordId][doctors[i]] = true;
        }

        emit RecordUploaded(recordId, msg.sender, params.patientAddress, params.department, block.timestamp);

        return recordId;
    }

    /**
     * @notice Berikan akses rekam medis ke dokter tertentu
     * @dev Hanya ADMIN atau dokter yang sudah punya akses yang bisa grant ke dokter lain.
     * @param recordId ID record yang akan diberikan aksesnya
     * @param doctorAddress Wallet address dokter yang akan diberi akses
     */
    function grantAccess(uint256 recordId, address doctorAddress) external {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        require(doctorAddress != address(0), "MedicalRecord: Invalid doctor address");

        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        IUserRegistry.Role targetRole = userRegistry.getRole(doctorAddress);

        // Hanya ADMIN atau yang sudah punya akses (dan merupakan DOCTOR/ADMIN) bisa grant
        require(
            callerRole == IUserRegistry.Role.ADMIN || _hasAccess(recordId, msg.sender),
            "MedicalRecord: Caller does not have access to grant"
        );

        // Target harus DOCTOR atau ADMIN
        require(
            targetRole == IUserRegistry.Role.DOCTOR || targetRole == IUserRegistry.Role.ADMIN,
            "MedicalRecord: Can only grant access to doctors or admins"
        );

        recordAccess[recordId][doctorAddress] = true;

        emit AccessGranted(recordId, doctorAddress, msg.sender, block.timestamp);
    }

    /**
     * @notice Cabut akses rekam medis dari dokter tertentu
     * @dev Hanya ADMIN yang bisa revoke akses.
     * @param recordId ID record
     * @param doctorAddress Wallet address dokter yang akan dicabut aksesnya
     */
    function revokeAccess(uint256 recordId, address doctorAddress) external onlyAdmin {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        require(recordAccess[recordId][doctorAddress], "MedicalRecord: Address does not have access");

        // Jangan revoke akses pasien sendiri
        require(
            doctorAddress != records[recordId].patientAddress,
            "MedicalRecord: Cannot revoke patient's own access"
        );

        recordAccess[recordId][doctorAddress] = false;

        emit AccessRevoked(recordId, doctorAddress, msg.sender, block.timestamp);
    }

    /**
     * @notice Berikan akses ke semua dokter di suatu departemen
     * @dev Hanya ADMIN yang bisa melakukan department-wide access grant.
     * @param recordId ID record
     * @param department Nama departemen yang akan diberi akses
     */
    function grantDepartmentAccess(
        uint256 recordId,
        string calldata department
    ) external onlyAdmin {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");

        address[] memory doctors = userRegistry.getDepartmentDoctors(department);
        require(doctors.length > 0, "MedicalRecord: No doctors in this department");

        for (uint256 i = 0; i < doctors.length; i++) {
            if (!recordAccess[recordId][doctors[i]]) {
                recordAccess[recordId][doctors[i]] = true;
                emit AccessGranted(recordId, doctors[i], msg.sender, block.timestamp);
            }
        }
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    /**
     * @notice Ambil data rekam medis berdasarkan ID
     * @dev Hanya wallet yang punya akses yang bisa membaca data record.
     * @param recordId ID record yang dicari
     * @return Record struct berisi semua data rekam medis
     */
    function getRecord(
        uint256 recordId
    ) external view onlyWithAccess(recordId) returns (Record memory) {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        return records[recordId];
    }

    /**
     * @notice Ambil semua ID record milik pasien tertentu
     * @dev Hanya ADMIN atau dokter yang punya akses minimal satu record pasien ini.
     *      Atau pasien itu sendiri.
     * @param patientAddress Wallet address pasien
     * @return Array of record IDs
     */
    function getPatientRecords(
        address patientAddress
    ) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);

        require(
            msg.sender == patientAddress ||
            callerRole == IUserRegistry.Role.ADMIN ||
            callerRole == IUserRegistry.Role.DOCTOR,
            "MedicalRecord: Access denied"
        );

        return patientRecords[patientAddress];
    }

    /**
     * @notice Ambil semua ID record dalam suatu departemen
     * @dev Hanya DOCTOR atau ADMIN yang bisa mengakses.
     * @param department Nama departemen
     * @return Array of record IDs
     */
    function getDepartmentRecords(
        string calldata department
    ) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);

        require(
            callerRole == IUserRegistry.Role.DOCTOR ||
            callerRole == IUserRegistry.Role.ADMIN,
            "MedicalRecord: Only doctors and admins can view department records"
        );

        return departmentRecords[department];
    }

    /**
     * @notice Cek apakah wallet address memiliki akses ke record tertentu
     * @param recordId ID record
     * @param userAddress Wallet yang dicek
     * @return true jika memiliki akses
     */
    function hasAccess(
        uint256 recordId,
        address userAddress
    ) external view returns (bool) {
        return _hasAccess(recordId, userAddress);
    }

    /**
     * @notice Verifikasi integritas file DICOM dengan membandingkan hash
     * @dev Fungsi ini public — bisa dipanggil siapa saja untuk verifikasi (termasuk halaman publik).
     *      Hash yang diberikan dibandingkan dengan hash yang tersimpan saat upload.
     * @param recordId ID record yang akan diverifikasi
     * @param fileHash SHA-256 hash file yang akan diverifikasi
     * @return isValid true jika hash cocok dan record aktif
     */
    function verifyRecord(
        uint256 recordId,
        string calldata fileHash
    ) external view returns (bool isValid) {
        if (!records[recordId].isActive) return false;
        if (recordId == 0 || recordId > totalRecords) return false;

        isValid = keccak256(bytes(records[recordId].fileHash)) == keccak256(bytes(fileHash));

        return isValid;
    }

    /**
     * @notice Ambil info publik record (tidak perlu akses) untuk halaman verifikasi
     * @dev Hanya return field non-sensitif: modality, studyDate, department, uploadedBy, uploadedAt
     * @param recordId ID record
     */
    function getPublicRecordInfo(uint256 recordId)
        external
        view
        returns (
            string memory modality,
            uint256 studyDate,
            string memory department,
            address uploadedBy,
            uint256 uploadedAt,
            bool isActive
        )
    {
        Record memory r = records[recordId];
        return (r.modality, r.studyDate, r.department, r.uploadedBy, r.uploadedAt, r.isActive);
    }

    // ─── Internal Functions ───────────────────────────────────────────────────

    /**
     * @dev Cek internal apakah wallet punya akses ke record
     *      ADMIN selalu punya akses ke semua record.
     */
    function _hasAccess(
        uint256 recordId,
        address userAddress
    ) internal view returns (bool) {
        // ADMIN selalu punya akses
        if (userRegistry.getRole(userAddress) == IUserRegistry.Role.ADMIN) {
            return true;
        }
        // Cek di mapping akses
        return recordAccess[recordId][userAddress];
    }
}
