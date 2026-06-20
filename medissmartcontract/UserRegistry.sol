// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IUserRegistry.sol";

/**
 * @title UserRegistry
 * @notice Contract pertama yang di-deploy. Mengelola registrasi dan role management
 *         semua pengguna sistem MediChain Radiology.
 * @dev Deploy contract ini PERTAMA sebelum MedicalRecord dan AuditTrail.
 *      Wallet yang men-deploy otomatis menjadi ADMIN pertama.
 */
contract UserRegistry is IUserRegistry {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct User {
        address walletAddress;  // wallet address pengguna
        Role role;              // role dalam sistem
        string name;            // nama lengkap
        string department;      // departemen (khusus DOCTOR & STAFF)
        uint256 registeredAt;   // Unix timestamp saat registrasi
        bool isActive;          // status aktif/non-aktif
        address registeredBy;   // siapa yang meregistrasi user ini
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    /// @notice Mapping dari wallet address ke data User
    mapping(address => User) public users;

    /// @notice Mapping dari nama departemen ke list wallet dokter
    mapping(string => address[]) public departmentDoctors;

    /// @notice Wallet address owner (Administrator pertama = deployer)
    address public owner;

    /// @notice Total jumlah user yang terdaftar
    uint256 public totalUsers;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted saat user baru berhasil terdaftar
    event UserRegistered(
        address indexed userAddress,
        Role role,
        string department,
        uint256 timestamp
    );

    /// @notice Emitted saat user di-revoke aksesnya
    event UserRevoked(
        address indexed userAddress,
        address indexed revokedBy,
        uint256 timestamp
    );

    /// @notice Emitted saat departemen dokter diupdate
    event DepartmentAssigned(
        address indexed doctor,
        string department,
        uint256 timestamp
    );

    // ─── Modifiers ────────────────────────────────────────────────────────────

    /**
     * @notice Hanya ADMIN yang boleh memanggil fungsi ini
     */
    modifier onlyAdmin() {
        require(
            users[msg.sender].role == Role.ADMIN && users[msg.sender].isActive,
            "UserRegistry: Caller is not an active admin"
        );
        _;
    }

    /**
     * @notice Pastikan user yang dimaksud masih aktif
     * @param userAddress Wallet address yang dicek
     */
    modifier onlyActive(address userAddress) {
        require(
            users[userAddress].isActive,
            "UserRegistry: User is not active"
        );
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @notice Constructor — wallet yang deploy otomatis menjadi ADMIN pertama
     * @dev Admin pertama memiliki registeredBy = address(0) (self-bootstrapped)
     */
    constructor() {
        owner = msg.sender;

        // Registrasi deployer sebagai ADMIN pertama
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: Role.ADMIN,
            name: "System Administrator",
            department: "Administration",
            registeredAt: block.timestamp,
            isActive: true,
            registeredBy: address(0) // bootstrapped, tidak ada yang meregistrasi
        });

        totalUsers = 1;

        emit UserRegistered(msg.sender, Role.ADMIN, "Administration", block.timestamp);
    }

    // ─── Write Functions ──────────────────────────────────────────────────────

    /**
     * @notice Registrasi user baru ke dalam sistem
     * @dev Hanya ADMIN aktif yang bisa memanggil fungsi ini.
     *      Jika role adalah DOCTOR, wallet otomatis ditambahkan ke departmentDoctors.
     * @param userAddress Wallet address user yang akan diregistrasi
     * @param role Role yang diberikan (1=ADMIN, 2=DOCTOR, 3=STAFF, 4=PATIENT)
     * @param name Nama lengkap user
     * @param department Nama departemen (wajib diisi untuk DOCTOR dan STAFF)
     */
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

        // Buat data user baru
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

        // Jika role DOCTOR, tambahkan ke mapping departementDoctors
        if (role == Role.DOCTOR && bytes(department).length > 0) {
            departmentDoctors[department].push(userAddress);
            emit DepartmentAssigned(userAddress, department, block.timestamp);
        }

        emit UserRegistered(userAddress, role, department, block.timestamp);
    }

    /**
     * @notice Revoke akses user (set isActive = false)
     * @dev User yang di-revoke tidak bisa melakukan operasi apapun di sistem.
     *      Data user tetap tersimpan untuk keperluan audit trail.
     *      Owner tidak bisa di-revoke oleh admin lain.
     * @param userAddress Wallet address user yang akan di-revoke
     */
    function revokeUser(address userAddress) external onlyAdmin {
        require(users[userAddress].walletAddress != address(0), "UserRegistry: User not found");
        require(users[userAddress].isActive, "UserRegistry: User already inactive");
        require(userAddress != owner, "UserRegistry: Cannot revoke contract owner");

        users[userAddress].isActive = false;

        emit UserRevoked(userAddress, msg.sender, block.timestamp);
    }

    /**
     * @notice Update departemen dokter dan update mapping departmentDoctors
     * @dev Menghapus dokter dari departemen lama dan menambahkan ke departemen baru.
     * @param doctorAddress Wallet address dokter yang akan diupdate
     * @param newDepartment Nama departemen baru
     */
    function updateDepartment(
        address doctorAddress,
        string calldata newDepartment
    ) external onlyAdmin {
        require(users[doctorAddress].walletAddress != address(0), "UserRegistry: Doctor not found");
        require(users[doctorAddress].role == Role.DOCTOR, "UserRegistry: User is not a doctor");
        require(bytes(newDepartment).length > 0, "UserRegistry: Department cannot be empty");

        string memory oldDepartment = users[doctorAddress].department;

        // Hapus dari departemen lama
        if (bytes(oldDepartment).length > 0) {
            _removeDoctorFromDepartment(doctorAddress, oldDepartment);
        }

        // Update department pada user data
        users[doctorAddress].department = newDepartment;

        // Tambahkan ke departemen baru
        departmentDoctors[newDepartment].push(doctorAddress);

        emit DepartmentAssigned(doctorAddress, newDepartment, block.timestamp);
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    /**
     * @notice Ambil data lengkap user berdasarkan wallet address
     * @param userAddress Wallet address yang dicari
     */
    function getUser(
        address userAddress
    )
        external
        view
        returns (
            address walletAddress,
            Role role,
            string memory name,
            string memory department,
            uint256 registeredAt,
            bool isActive,
            address registeredBy
        )
    {
        User memory u = users[userAddress];
        return (
            u.walletAddress,
            u.role,
            u.name,
            u.department,
            u.registeredAt,
            u.isActive,
            u.registeredBy
        );
    }

    /**
     * @notice Ambil role dari wallet address
     * @param userAddress Wallet yang dicek
     * @return Role enum (0=UNREGISTERED jika tidak ada di mapping)
     */
    function getRole(address userAddress) external view returns (Role) {
        if (users[userAddress].walletAddress == address(0)) {
            return Role.UNREGISTERED;
        }
        if (!users[userAddress].isActive) {
            return Role.UNREGISTERED;
        }
        return users[userAddress].role;
    }

    /**
     * @notice Ambil semua wallet dokter dalam sebuah departemen
     * @param department Nama departemen
     * @return Array wallet address dokter aktif di departemen tersebut
     */
    function getDepartmentDoctors(
        string calldata department
    ) external view returns (address[] memory) {
        return departmentDoctors[department];
    }

    /**
     * @notice Cek apakah wallet memiliki role minimal tertentu
     * @dev Membandingkan nilai numerik Role enum.
     *      Role.ADMIN=1 > Role.DOCTOR=2 — PERHATIAN: nilai enum bukan urutan hierarki.
     *      Fungsi ini mengecek apakah role persis sama, bukan lebih tinggi.
     *      Untuk akses minimal: ADMIN bisa akses semua, DOCTOR bisa akses DOCTOR+STAFF+PATIENT level.
     * @param userAddress Wallet yang dicek
     * @param requiredRole Role yang diperlukan
     * @return true jika user aktif dan memiliki role yang sesuai
     */
    function isAuthorized(
        address userAddress,
        Role requiredRole
    ) external view returns (bool) {
        if (!users[userAddress].isActive) return false;
        if (users[userAddress].walletAddress == address(0)) return false;

        Role userRole = users[userAddress].role;

        // ADMIN bisa akses segalanya
        if (userRole == Role.ADMIN) return true;

        // Cek role exact match
        return userRole == requiredRole;
    }

    // ─── Internal Functions ───────────────────────────────────────────────────

    /**
     * @dev Hapus address dokter dari array departement (swap and pop)
     * @param doctorAddress Wallet address yang akan dihapus
     * @param department Nama departemen yang akan diupdate
     */
    function _removeDoctorFromDepartment(
        address doctorAddress,
        string memory department
    ) internal {
        address[] storage doctors = departmentDoctors[department];
        uint256 len = doctors.length;

        for (uint256 i = 0; i < len; i++) {
            if (doctors[i] == doctorAddress) {
                // Swap dengan elemen terakhir lalu pop (gas efficient)
                doctors[i] = doctors[len - 1];
                doctors.pop();
                break;
            }
        }
    }
}
