// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ─── Inline Interface ─────────────────────────────────────────────────────────

interface IUserRegistry {
    enum Role { UNREGISTERED, ADMIN, DOCTOR, STAFF, PATIENT }
    function getRole(address userAddress) external view returns (Role);
    function isAuthorized(address userAddress, Role minimumRole) external view returns (bool);
    function getUser(address userAddress) external view returns (
        address, Role, string memory, string memory, uint256, bool, address
    );
    function getDepartmentDoctors(string calldata department) external view returns (address[] memory);
}

// ─── AuditTrail Contract ──────────────────────────────────────────────────────

/**
 * @title AuditTrail
 * @notice Contract ketiga yang di-deploy. Mencatat semua aktivitas secara immutable.
 * @dev Constructor: masukkan address UserRegistry (Step 1) dan MedicalRecord (Step 2)
 */
contract AuditTrail {

    struct AuditEntry {
        uint256 id;
        string action;
        address performedBy;
        uint256 targetRecordId;
        address targetUser;
        uint256 timestamp;
        string department;
        string details;
    }

    mapping(uint256 => AuditEntry) public auditLog;
    mapping(address => uint256[]) public userAuditLog;
    mapping(uint256 => uint256[]) public recordAuditLog;
    uint256 public totalEntries;
    address public medicalRecordContract;
    IUserRegistry public userRegistry;

    event ActionLogged(uint256 indexed entryId, string action, address indexed performedBy, uint256 indexed targetRecordId, uint256 timestamp);

    constructor(address _userRegistry, address _medicalRecord) {
        require(_userRegistry != address(0), "AuditTrail: Invalid UserRegistry address");
        require(_medicalRecord != address(0), "AuditTrail: Invalid MedicalRecord address");
        userRegistry = IUserRegistry(_userRegistry);
        medicalRecordContract = _medicalRecord;
    }

    function logAction(
        string calldata action,
        uint256 targetRecordId,
        address targetUser,
        string calldata details
    ) external returns (uint256 entryId) {
        bool isRegisteredUser = userRegistry.getRole(msg.sender) != IUserRegistry.Role.UNREGISTERED;
        bool isMedicalRecordContract = msg.sender == medicalRecordContract;
        require(isRegisteredUser || isMedicalRecordContract, "AuditTrail: Caller is not registered or authorized contract");

        string memory department = _getDepartment(msg.sender);
        entryId = ++totalEntries;

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

        userAuditLog[msg.sender].push(entryId);
        if (targetRecordId > 0) {
            recordAuditLog[targetRecordId].push(entryId);
        }

        emit ActionLogged(entryId, action, msg.sender, targetRecordId, block.timestamp);
        return entryId;
    }

    function getAuditLog(uint256 from, uint256 to) external view returns (AuditEntry[] memory entries) {
        require(userRegistry.getRole(msg.sender) == IUserRegistry.Role.ADMIN, "AuditTrail: Only admins can view full audit log");
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

    function getUserAuditLog(address userAddress) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        require(msg.sender == userAddress || callerRole == IUserRegistry.Role.ADMIN, "AuditTrail: Access denied");
        return userAuditLog[userAddress];
    }

    function getRecordAuditLog(uint256 recordId) external view returns (uint256[] memory) {
        require(userRegistry.getRole(msg.sender) != IUserRegistry.Role.UNREGISTERED, "AuditTrail: Caller is not registered");
        return recordAuditLog[recordId];
    }

    function getEntry(uint256 entryId) external view returns (AuditEntry memory) {
        require(entryId >= 1 && entryId <= totalEntries, "AuditTrail: Invalid entry ID");
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        AuditEntry memory entry = auditLog[entryId];
        require(
            callerRole == IUserRegistry.Role.ADMIN || msg.sender == entry.performedBy || msg.sender == entry.targetUser,
            "AuditTrail: Access denied to this entry"
        );
        return entry;
    }

    function getTotalEntries() external view returns (uint256) {
        return totalEntries;
    }

    function getLatestEntries(uint256 count) external view returns (AuditEntry[] memory entries) {
        require(userRegistry.getRole(msg.sender) == IUserRegistry.Role.ADMIN, "AuditTrail: Only admins can view latest entries");
        if (count > totalEntries) count = totalEntries;
        entries = new AuditEntry[](count);
        uint256 startId = totalEntries - count + 1;
        for (uint256 i = 0; i < count; i++) {
            entries[i] = auditLog[startId + i];
        }
        return entries;
    }

    function _getDepartment(address userAddress) internal view returns (string memory) {
        if (userAddress == medicalRecordContract) return "System";
        try userRegistry.getUser(userAddress) returns (address, IUserRegistry.Role, string memory, string memory department, uint256, bool, address) {
            return department;
        } catch {
            return "Unknown";
        }
    }
}
