// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IUserRegistry
 * @notice Interface untuk UserRegistry contract — digunakan oleh MedicalRecord dan AuditTrail
 */
interface IUserRegistry {
    enum Role {
        UNREGISTERED, // 0 — wallet belum terdaftar
        ADMIN,        // 1 — administrator sistem
        DOCTOR,       // 2 — dokter radiologi
        STAFF,        // 3 — petugas input data
        PATIENT       // 4 — pasien
    }

    /**
     * @notice Ambil role dari sebuah wallet address
     * @param userAddress Wallet address yang dicek
     * @return Role enum value
     */
    function getRole(address userAddress) external view returns (Role);

    /**
     * @notice Cek apakah wallet memiliki role minimal tertentu
     * @param userAddress Wallet yang dicek
     * @param minimumRole Role minimum yang diperlukan
     * @return true jika role >= minimumRole
     */
    function isAuthorized(address userAddress, Role minimumRole) external view returns (bool);

    /**
     * @notice Ambil data lengkap user
     * @param userAddress Wallet address user
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
        );

    /**
     * @notice Ambil list semua wallet dokter di suatu departemen
     * @param department Nama departemen
     * @return Array of wallet addresses
     */
    function getDepartmentDoctors(
        string calldata department
    ) external view returns (address[] memory);
}
