// ─── MediChain Radiology — Global Constants ───────────────────────────────────

export const DEPARTMENTS = [
  'Radiology',
  'Emergency Radiology',
  'Neuroradiology',
  'Cardiovascular Radiology',
  'Pediatric Radiology',
  'Musculoskeletal Radiology',
  'Interventional Radiology',
]

export const MODALITY_LABELS: Record<string, string> = {
  CT: 'CT Scan',
  XRAY: 'X-Ray',
}

export const MODALITY_OPTIONS = [
  { value: 'CT', label: 'CT Scan' },
  { value: 'XRAY', label: 'X-Ray' },
]

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  UPLOAD: 'File uploaded to IPFS',
  DOWNLOAD: 'File decrypted & downloaded',
  GRANT_ACCESS: 'Access granted',
  REVOKE_ACCESS: 'Access revoked',
  LOGIN: 'User logged in',
  VIEW: 'Record accessed',
}

export const AUDIT_ACTION_COLORS: Record<string, string> = {
  UPLOAD: 'text-green-600 bg-green-50',
  DOWNLOAD: 'text-blue-600 bg-blue-50',
  GRANT_ACCESS: 'text-teal-600 bg-teal-50',
  REVOKE_ACCESS: 'text-red-600 bg-red-50',
  LOGIN: 'text-purple-600 bg-purple-50',
  VIEW: 'text-amber-600 bg-amber-50',
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  DOCTOR: 'Doctor',
  STAFF: 'Staff',
  PATIENT: 'Patient',
  UNREGISTERED: 'Unregistered',
}

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'badge-admin',
  DOCTOR: 'badge-doctor',
  STAFF: 'badge-staff',
  PATIENT: 'badge-patient',
  UNREGISTERED: 'bg-gray-100 text-gray-600',
}

export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'PATIENT', label: 'Patient' },
]

// Monad Testnet config
export const MONAD_TESTNET = {
  chainId: 10143,
  name: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  explorerUrl: 'https://testnet.monadexplorer.com',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
}

// NJCS default parameters
export const NJCS_DEFAULT_PARAMS = {
  a: 0.6,
  b: 0.3,
  c: 1.0,
  dt: 0.01,
}

// NJCS warmup iterations (discard first N steps to ensure chaotic behavior)
export const NJCS_WARMUP_ITERATIONS = 1000

// Max file size for DICOM upload (100MB)
export const MAX_FILE_SIZE_MB = 100
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// Supported file types
export const SUPPORTED_FILE_TYPES = ['.dcm', '.jpg', '.jpeg', '.png']
export const SUPPORTED_MIME_TYPES = [
  'application/dicom',
  'image/jpeg',
  'image/png',
  'image/jpg',
]

// Pagination
export const AUDIT_PAGE_SIZE = 20
export const RECORDS_PAGE_SIZE = 10
