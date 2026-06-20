// ─── MediChain Radiology — Global TypeScript Types ───────────────────────────

export type UserRole = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT' | 'UNREGISTERED'

export interface UserProfile {
  address: string
  role: UserRole
  name: string
  department: string
  registeredAt: number
  isActive: boolean
}

export interface MedicalRecord {
  id: string
  patientAddress: string
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
  modality: 'CT' | 'XRAY'
  bodyPart: string
  studyDate: number
  department: string
  uploadedBy: string
  dicomCID: string
  keyEnvelopeCID: string
  txHash: string
  blockNumber: number
  isVerified: boolean
}

export interface AuditLog {
  id: string
  action: 'UPLOAD' | 'DOWNLOAD' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'LOGIN' | 'VIEW'
  performedBy: string
  targetRecord?: string
  targetUser?: string
  timestamp: number
  txHash: string
  department: string
}

export interface EncryptionResult {
  ciphertext: string
  chaosParams: {
    x0: number
    y0: number
    z0: number
    a: number
    b: number
    c: number
  }
}

export interface DicomMetadata {
  patientName?: string
  patientId?: string
  birthDate?: string
  studyDate?: string
  modality?: string
  bodyPartExamined?: string
  institutionName?: string
  studyDescription?: string
}

export interface VerificationResult {
  isValid: boolean
  txHash: string
  blockNumber: number
  timestamp: number
  modality: string
  studyDate: number
  department: string
  uploadedBy: string
}

// ─── Upload form data ─────────────────────────────────────────────────────────
export interface UploadFormData {
  patientName: string
  patientId: string
  birthDate: string
  studyDate: string
  modality: 'CT' | 'XRAY'
  bodyPart: string
  department: string
  notes?: string
}

// ─── Encryption progress step ────────────────────────────────────────────────
export interface EncryptionStep {
  id: string
  label: string
  detail?: string
  status: 'pending' | 'active' | 'done' | 'error'
}

// ─── Access grant ────────────────────────────────────────────────────────────
export interface AccessGrant {
  recordId: string
  grantedTo: string
  grantedBy: string
  grantedAt: number
}

// ─── Dashboard metrics ────────────────────────────────────────────────────────
export interface DashboardMetrics {
  totalPatients: number
  totalCTScans: number
  totalXRays: number
  totalVerified: number
  uploadsThisMonth: number
  uploadsToday: number
}

// ─── Chart data types ────────────────────────────────────────────────────────
export interface MonthlyData {
  month: string
  CT: number
  XRAY: number
}

export interface DepartmentData {
  department: string
  count: number
}
