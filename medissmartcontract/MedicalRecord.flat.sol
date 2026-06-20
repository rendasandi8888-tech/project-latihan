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

// ─── MedicalRecord Contract ───────────────────────────────────────────────────

contract MedicalRecord {

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
        uint256 id;
        address patientAddress;
        string encryptedPatientName;
        string encryptedPatientId;
        string encryptedBirthDate;
        string modality;
        string bodyPart;
        uint256 studyDate;
        string department;
        address uploadedBy;
        string dicomCID;
        string keyEnvelopeCID;
        string fileHash;
        uint256 uploadedAt;
        bool isActive;
    }

    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) public patientRecords;
    mapping(string => uint256[]) public departmentRecords;
    mapping(uint256 => mapping(address => bool)) public recordAccess;
    uint256 public totalRecords;
    IUserRegistry public userRegistry;

    event RecordUploaded(uint256 indexed recordId, address indexed uploadedBy, address indexed patientAddress, string department, uint256 timestamp);
    event AccessGranted(uint256 indexed recordId, address indexed grantedTo, address indexed grantedBy, uint256 timestamp);
    event AccessRevoked(uint256 indexed recordId, address indexed revokedFrom, address indexed revokedBy, uint256 timestamp);
    event RecordVerified(uint256 indexed recordId, address indexed verifiedBy, bool isValid, uint256 timestamp);

    constructor(address _userRegistry) {
        require(_userRegistry != address(0), "MedicalRecord: Invalid UserRegistry address");
        userRegistry = IUserRegistry(_userRegistry);
    }

    modifier onlyStaffOrDoctor() {
        IUserRegistry.Role role = userRegistry.getRole(msg.sender);
        require(
            role == IUserRegistry.Role.STAFF || role == IUserRegistry.Role.DOCTOR || role == IUserRegistry.Role.ADMIN,
            "MedicalRecord: Caller must be Staff, Doctor, or Admin"
        );
        _;
    }

    modifier onlyAdmin() {
        require(userRegistry.getRole(msg.sender) == IUserRegistry.Role.ADMIN, "MedicalRecord: Caller is not an admin");
        _;
    }

    modifier onlyWithAccess(uint256 recordId) {
        require(_hasAccess(recordId, msg.sender), "MedicalRecord: Access denied to this record");
        _;
    }

    function uploadRecord(UploadRecordParams calldata params) external onlyStaffOrDoctor returns (uint256 recordId) {
        require(params.patientAddress != address(0), "MedicalRecord: Invalid patient address");
        require(bytes(params.dicomCID).length > 0, "MedicalRecord: DICOM CID cannot be empty");
        require(bytes(params.keyEnvelopeCID).length > 0, "MedicalRecord: Key envelope CID cannot be empty");
        require(bytes(params.fileHash).length > 0, "MedicalRecord: File hash cannot be empty");
        require(
            keccak256(bytes(params.modality)) == keccak256(bytes("CT")) ||
            keccak256(bytes(params.modality)) == keccak256(bytes("XRAY")),
            "MedicalRecord: Invalid modality"
        );

        recordId = ++totalRecords;

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

        patientRecords[params.patientAddress].push(recordId);
        departmentRecords[params.department].push(recordId);
        recordAccess[recordId][msg.sender] = true;
        recordAccess[recordId][params.patientAddress] = true;

        address[] memory doctors = userRegistry.getDepartmentDoctors(params.department);
        for (uint256 i = 0; i < doctors.length; i++) {
            recordAccess[recordId][doctors[i]] = true;
        }

        emit RecordUploaded(recordId, msg.sender, params.patientAddress, params.department, block.timestamp);
        return recordId;
    }

    function grantAccess(uint256 recordId, address doctorAddress) external {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        require(doctorAddress != address(0), "MedicalRecord: Invalid doctor address");
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        IUserRegistry.Role targetRole = userRegistry.getRole(doctorAddress);
        require(callerRole == IUserRegistry.Role.ADMIN || _hasAccess(recordId, msg.sender), "MedicalRecord: No access to grant");
        require(targetRole == IUserRegistry.Role.DOCTOR || targetRole == IUserRegistry.Role.ADMIN, "MedicalRecord: Target must be doctor or admin");
        recordAccess[recordId][doctorAddress] = true;
        emit AccessGranted(recordId, doctorAddress, msg.sender, block.timestamp);
    }

    function revokeAccess(uint256 recordId, address doctorAddress) external onlyAdmin {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        require(recordAccess[recordId][doctorAddress], "MedicalRecord: Address does not have access");
        require(doctorAddress != records[recordId].patientAddress, "MedicalRecord: Cannot revoke patient access");
        recordAccess[recordId][doctorAddress] = false;
        emit AccessRevoked(recordId, doctorAddress, msg.sender, block.timestamp);
    }

    function grantDepartmentAccess(uint256 recordId, string calldata department) external onlyAdmin {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        address[] memory doctors = userRegistry.getDepartmentDoctors(department);
        require(doctors.length > 0, "MedicalRecord: No doctors in department");
        for (uint256 i = 0; i < doctors.length; i++) {
            if (!recordAccess[recordId][doctors[i]]) {
                recordAccess[recordId][doctors[i]] = true;
                emit AccessGranted(recordId, doctors[i], msg.sender, block.timestamp);
            }
        }
    }

    function getRecord(uint256 recordId) external view onlyWithAccess(recordId) returns (Record memory) {
        require(records[recordId].isActive, "MedicalRecord: Record is not active");
        return records[recordId];
    }

    function getPatientRecords(address patientAddress) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        require(msg.sender == patientAddress || callerRole == IUserRegistry.Role.ADMIN || callerRole == IUserRegistry.Role.DOCTOR, "MedicalRecord: Access denied");
        return patientRecords[patientAddress];
    }

    function getDepartmentRecords(string calldata department) external view returns (uint256[] memory) {
        IUserRegistry.Role callerRole = userRegistry.getRole(msg.sender);
        require(callerRole == IUserRegistry.Role.DOCTOR || callerRole == IUserRegistry.Role.ADMIN, "MedicalRecord: Only doctors and admins");
        return departmentRecords[department];
    }

    function hasAccess(uint256 recordId, address userAddress) external view returns (bool) {
        return _hasAccess(recordId, userAddress);
    }

    function verifyRecord(uint256 recordId, string calldata fileHash) external view returns (bool isValid) {
        if (!records[recordId].isActive) return false;
        if (recordId == 0 || recordId > totalRecords) return false;
        return keccak256(bytes(records[recordId].fileHash)) == keccak256(bytes(fileHash));
    }

    function getPublicRecordInfo(uint256 recordId) external view returns (
        string memory modality, uint256 studyDate, string memory department,
        address uploadedBy, uint256 uploadedAt, bool isActive
    ) {
        Record memory r = records[recordId];
        return (r.modality, r.studyDate, r.department, r.uploadedBy, r.uploadedAt, r.isActive);
    }

    function _hasAccess(uint256 recordId, address userAddress) internal view returns (bool) {
        if (userRegistry.getRole(userAddress) == IUserRegistry.Role.ADMIN) return true;
        return recordAccess[recordId][userAddress];
    }
}
