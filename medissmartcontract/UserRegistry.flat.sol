// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ─── Inline Interface (untuk Thirdweb Contract Builder) ──────────────────────

interface IUserRegistry {
    enum Role {
        UNREGISTERED,
        ADMIN,
        DOCTOR,
        STAFF,
        PATIENT
    }
    function getRole(address userAddress) external view returns (Role);
    function isAuthorized(address userAddress, Role minimumRole) external view returns (bool);
    function getUser(address userAddress) external view returns (
        address walletAddress,
        Role role,
        string memory name,
        string memory department,
        uint256 registeredAt,
        bool isActive,
        address registeredBy
    );
    function getDepartmentDoctors(string calldata department) external view returns (address[] memory);
}

// ─── UserRegistry Contract ────────────────────────────────────────────────────

/**
 * @title UserRegistry
 * @notice Contract pertama yang di-deploy. Mengelola registrasi dan role management
 *         semua pengguna sistem MediChain Radiology.
 * @dev Deploy contract ini PERTAMA sebelum MedicalRecord dan AuditTrail.
 *      Wallet yang men-deploy otomatis menjadi ADMIN pertama.
 */
contract UserRegistry is IUserRegistry {

    struct User {
        address walletAddress;
        Role role;
        string name;
        string department;
        uint256 registeredAt;
        bool isActive;
        address registeredBy;
    }

    mapping(address => User) public users;
    mapping(string => address[]) public departmentDoctors;
    address public owner;
    uint256 public totalUsers;

    event UserRegistered(address indexed userAddress, Role role, string department, uint256 timestamp);
    event UserRevoked(address indexed userAddress, address indexed revokedBy, uint256 timestamp);
    event DepartmentAssigned(address indexed doctor, string department, uint256 timestamp);

    modifier onlyAdmin() {
        require(
            users[msg.sender].role == Role.ADMIN && users[msg.sender].isActive,
            "UserRegistry: Caller is not an active admin"
        );
        _;
    }

    modifier onlyActive(address userAddress) {
        require(users[userAddress].isActive, "UserRegistry: User is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: Role.ADMIN,
            name: "System Administrator",
            department: "Administration",
            registeredAt: block.timestamp,
            isActive: true,
            registeredBy: address(0)
        });
        totalUsers = 1;
        emit UserRegistered(msg.sender, Role.ADMIN, "Administration", block.timestamp);
    }

    function registerUser(
        address userAddress,
        Role role,
        string calldata name,
        string calldata department
    ) external onlyAdmin {
        require(userAddress != address(0), "UserRegistry: Invalid address");
        require(users[userAddress].walletAddress == address(0), "UserRegistry: User already registered");
        require(role != Role.UNREGISTERED, "UserRegistry: Cannot register as UNREGISTERED");
        require(bytes(name).length > 0, "UserRegistry: Name cannot be empty");

        users[userAddress] = User({
            walletAddress: userAddress,
            role: role,
            name: name,
            department: department,
            registeredAt: block.timestamp,
            isActive: true,
            registeredBy: msg.sender
        });

        totalUsers++;

        if (role == Role.DOCTOR && bytes(department).length > 0) {
            departmentDoctors[department].push(userAddress);
            emit DepartmentAssigned(userAddress, department, block.timestamp);
        }

        emit UserRegistered(userAddress, role, department, block.timestamp);
    }

    function revokeUser(address userAddress) external onlyAdmin {
        require(users[userAddress].walletAddress != address(0), "UserRegistry: User not found");
        require(users[userAddress].isActive, "UserRegistry: User already inactive");
        require(userAddress != owner, "UserRegistry: Cannot revoke contract owner");
        users[userAddress].isActive = false;
        emit UserRevoked(userAddress, msg.sender, block.timestamp);
    }

    function updateDepartment(address doctorAddress, string calldata newDepartment) external onlyAdmin {
        require(users[doctorAddress].walletAddress != address(0), "UserRegistry: Doctor not found");
        require(users[doctorAddress].role == Role.DOCTOR, "UserRegistry: User is not a doctor");
        require(bytes(newDepartment).length > 0, "UserRegistry: Department cannot be empty");

        string memory oldDepartment = users[doctorAddress].department;
        if (bytes(oldDepartment).length > 0) {
            _removeDoctorFromDepartment(doctorAddress, oldDepartment);
        }
        users[doctorAddress].department = newDepartment;
        departmentDoctors[newDepartment].push(doctorAddress);
        emit DepartmentAssigned(doctorAddress, newDepartment, block.timestamp);
    }

    function getUser(address userAddress) external view returns (
        address walletAddress, Role role, string memory name, string memory department,
        uint256 registeredAt, bool isActive, address registeredBy
    ) {
        User memory u = users[userAddress];
        return (u.walletAddress, u.role, u.name, u.department, u.registeredAt, u.isActive, u.registeredBy);
    }

    function getRole(address userAddress) external view returns (Role) {
        if (users[userAddress].walletAddress == address(0)) return Role.UNREGISTERED;
        if (!users[userAddress].isActive) return Role.UNREGISTERED;
        return users[userAddress].role;
    }

    function getDepartmentDoctors(string calldata department) external view returns (address[] memory) {
        return departmentDoctors[department];
    }

    function isAuthorized(address userAddress, Role requiredRole) external view returns (bool) {
        if (!users[userAddress].isActive) return false;
        if (users[userAddress].walletAddress == address(0)) return false;
        Role userRole = users[userAddress].role;
        if (userRole == Role.ADMIN) return true;
        return userRole == requiredRole;
    }

    function _removeDoctorFromDepartment(address doctorAddress, string memory department) internal {
        address[] storage doctors = departmentDoctors[department];
        uint256 len = doctors.length;
        for (uint256 i = 0; i < len; i++) {
            if (doctors[i] == doctorAddress) {
                doctors[i] = doctors[len - 1];
                doctors.pop();
                break;
            }
        }
    }
}
