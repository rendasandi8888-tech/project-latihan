# MediChain Radiology — Smart Contract Deployment Guide

## Overview
3 contracts yang harus di-deploy ke **Monad Testnet (Chain ID: 10143)** dalam urutan ini:
1. `UserRegistry.sol` — tidak ada dependency
2. `MedicalRecord.sol` — butuh address UserRegistry
3. `AuditTrail.sol` — butuh address UserRegistry + MedicalRecord

---

## Prerequisites
- MetaMask terpasang di browser
- Wallet memiliki MON token untuk gas (faucet: https://faucet.monad.xyz)
- Monad Testnet sudah ditambahkan di MetaMask:
  - Network Name: Monad Testnet
  - RPC URL: https://testnet-rpc.monad.xyz
  - Chain ID: 10143
  - Symbol: MON
  - Explorer: https://testnet.monadexplorer.com

---

## Langkah Deployment

### STEP 1 — Deploy UserRegistry.sol

1. Buka https://thirdweb.com/dashboard
2. Klik **"Deploy Contract"** → **"Build your own"** → **"Solidity"**
3. Paste isi file `UserRegistry.sol` (termasuk import, tapi tanpa IUserRegistry.sol)
   - **PENTING**: Karena Thirdweb tidak support multi-file, gabungkan IUserRegistry.sol
     ke dalam UserRegistry.sol dengan cara hapus baris `import "./IUserRegistry.sol";`
     dan paste isi IUserRegistry.sol di bagian atas file sebelum `contract UserRegistry`
4. Pilih network: **Monad Testnet** (Chain ID: 10143)
5. Constructor arguments: *(tidak ada)*
6. Klik **Deploy** → konfirmasi di MetaMask
7. **Catat address** yang muncul setelah deploy sukses
   - Contoh: `0xABCD...1234`

### STEP 2 — Deploy MedicalRecord.sol

1. Kembali ke Thirdweb → Deploy Contract
2. Paste isi `MedicalRecord.sol` (gabungkan dengan IUserRegistry.sol yang sudah di-inline)
3. Pilih network: **Monad Testnet**
4. Constructor arguments:
   - `_userRegistry`: **[address UserRegistry dari Step 1]**
5. Klik **Deploy** → konfirmasi di MetaMask
6. **Catat address** MedicalRecord

### STEP 3 — Deploy AuditTrail.sol

1. Kembali ke Thirdweb → Deploy Contract
2. Paste isi `AuditTrail.sol` (gabungkan dengan IUserRegistry.sol)
3. Pilih network: **Monad Testnet**
4. Constructor arguments:
   - `_userRegistry`: **[address UserRegistry dari Step 1]**
   - `_medicalRecord`: **[address MedicalRecord dari Step 2]**
5. Klik **Deploy** → konfirmasi di MetaMask
6. **Catat address** AuditTrail

---

## Update .env.local

Setelah ketiga contract ter-deploy, update file `.env.local` di project medis:

```env
NEXT_PUBLIC_USER_REGISTRY_ADDRESS=0x[address dari Step 1]
NEXT_PUBLIC_MEDICAL_RECORD_ADDRESS=0x[address dari Step 2]
NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS=0x[address dari Step 3]
```

---

## Cara Inline IUserRegistry ke dalam Contract

Karena Thirdweb Contract Builder tidak support import file terpisah,
ganti baris import dengan isi interface langsung:

**Sebelum:**
```solidity
import "./IUserRegistry.sol";

contract UserRegistry is IUserRegistry {
```

**Sesudah (di UserRegistry.sol, MedicalRecord.sol, AuditTrail.sol):**
```solidity
interface IUserRegistry {
    enum Role { UNREGISTERED, ADMIN, DOCTOR, STAFF, PATIENT }
    function getRole(address userAddress) external view returns (Role);
    function isAuthorized(address userAddress, Role minimumRole) external view returns (bool);
    function getUser(address userAddress) external view returns (
        address, Role, string memory, string memory, uint256, bool, address
    );
    function getDepartmentDoctors(string calldata department) external view returns (address[] memory);
}

contract UserRegistry is IUserRegistry {
```

---

## Verifikasi Deployment

Setelah deploy, cek di Monad Explorer:
- https://testnet.monadexplorer.com/address/[contract_address]

Pastikan:
- Contract code ter-verify
- Constructor sudah dipanggil dengan benar
- Owner/deployer sudah tercatat sebagai ADMIN pertama (untuk UserRegistry)
