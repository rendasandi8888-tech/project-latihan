import { getContract, readContract, prepareContractCall, sendTransaction, waitForReceipt, getContractEvents, prepareEvent } from 'thirdweb'
import type { Account } from 'thirdweb/wallets'
import { client, monadTestnet } from './client'

const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS!
const MEDICAL_RECORD_ADDRESS = process.env.NEXT_PUBLIC_MEDICAL_RECORD_ADDRESS!
const AUDIT_TRAIL_ADDRESS = process.env.NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS!

const userRegistryContract = getContract({ client, chain: monadTestnet, address: USER_REGISTRY_ADDRESS })
const medicalRecordContract = getContract({ client, chain: monadTestnet, address: MEDICAL_RECORD_ADDRESS })
const auditTrailContract = getContract({ client, chain: monadTestnet, address: AUDIT_TRAIL_ADDRESS })

export interface MedicalRecordData {
  id: number
  patientAddress: string
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
  modality: string
  bodyPart: string
  studyDate: number
  department: string
  uploadedBy: string
  dicomCID: string
  keyEnvelopeCID: string
  fileHash: string
  uploadedAt: number
  isActive: boolean
}

export interface UploadRecordParams {
  patientAddress: string
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
  modality: 'CT' | 'XRAY'
  bodyPart: string
  studyDate: number
  department: string
  dicomCID: string
  keyEnvelopeCID: string
  fileHash: string
}

export interface AuditEntry {
  id: number
  action: string
  performedBy: string
  targetRecordId: number
  targetUser: string
  timestamp: number
  department: string
  details: string
}

// ─── UserRegistry: Read ───────────────────────────────────────────────────────

export async function getUserRole(address: string): Promise<number> {
  try {
    const role = await readContract({
      contract: userRegistryContract,
      method: 'function getRole(address userAddress) view returns (uint8)',
      params: [address],
    })
    return Number(role)
  } catch (error) {
    console.error('Error fetching user role:', error)
    return 0
  }
}

export async function getUserProfile(address: string) {
  try {
    const result = await readContract({
      contract: userRegistryContract,
      method: 'function getUser(address userAddress) view returns (address walletAddress, uint8 role, string name, string department, uint256 registeredAt, bool isActive, address registeredBy)',
      params: [address],
    })
    const [walletAddress, role, name, department, registeredAt, isActive, registeredBy] = result as any[]
    return {
      address: walletAddress as string,
      role: Number(role),
      name: name as string,
      department: department as string,
      registeredAt: Number(registeredAt),
      isActive: isActive as boolean,
      registeredBy: registeredBy as string,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function getDepartmentDoctors(department: string): Promise<string[]> {
  try {
    const result = await readContract({
      contract: userRegistryContract,
      method: 'function getDepartmentDoctors(string department) view returns (address[])',
      params: [department],
    })
    return result as string[]
  } catch (error) {
    console.error('Error fetching department doctors:', error)
    return []
  }
}

export async function getAllUsers(): Promise<Array<{
  address: string
  role: number
  name: string
  department: string
  registeredAt: number
  isActive: boolean
  registeredBy: string
}>> {
  try {
    const events = await getContractEvents({
      contract: userRegistryContract,
      events: [
        prepareEvent({
          signature: 'event UserRegistered(address indexed userAddress, uint8 role, string department, uint256 timestamp)',
        }),
      ],
      fromBlock: BigInt(0),
    })
    const uniqueAddresses = Array.from(new Set(events.map((e: any) => e.args.userAddress as string)))
    const profiles = await Promise.all(uniqueAddresses.map(addr => getUserProfile(addr)))
    return profiles
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map(p => ({
        address: p.address,
        role: p.role,
        name: p.name,
        department: p.department,
        registeredAt: p.registeredAt,
        isActive: p.isActive,
        registeredBy: p.registeredBy,
      }))
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

// ─── UserRegistry: Write ──────────────────────────────────────────────────────

export async function registerUser(
  params: { userAddress: string; role: number; name: string; department: string },
  account: Account
): Promise<string> {
  const transaction = prepareContractCall({
    contract: userRegistryContract,
    method: 'function registerUser(address userAddress, uint8 role, string name, string department)',
    params: [params.userAddress, params.role, params.name, params.department],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

export async function revokeUser(userAddress: string, account: Account): Promise<string> {
  const transaction = prepareContractCall({
    contract: userRegistryContract,
    method: 'function revokeUser(address userAddress)',
    params: [userAddress],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

// ─── MedicalRecord: Write ─────────────────────────────────────────────────────

export async function uploadRecord(
  params: UploadRecordParams,
  account: Account
): Promise<{ recordId: number; txHash: string }> {
  const transaction = prepareContractCall({
    contract: medicalRecordContract,
    method: 'function uploadRecord((address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, string dicomCID, string keyEnvelopeCID, string fileHash) params) returns (uint256 recordId)',
    params: [{
      patientAddress: params.patientAddress,
      encryptedPatientName: params.encryptedPatientName,
      encryptedPatientId: params.encryptedPatientId,
      encryptedBirthDate: params.encryptedBirthDate,
      modality: params.modality,
      bodyPart: params.bodyPart,
      studyDate: BigInt(params.studyDate),
      department: params.department,
      dicomCID: params.dicomCID,
cd C:\LatihanProject\medis
$contracts = @'
import { getContract, readContract, prepareContractCall, sendTransaction, waitForReceipt, getContractEvents, prepareEvent } from 'thirdweb'
import type { Account } from 'thirdweb/wallets'
import { client, monadTestnet } from './client'

const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS!
const MEDICAL_RECORD_ADDRESS = process.env.NEXT_PUBLIC_MEDICAL_RECORD_ADDRESS!
const AUDIT_TRAIL_ADDRESS = process.env.NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS!

const userRegistryContract = getContract({ client, chain: monadTestnet, address: USER_REGISTRY_ADDRESS })
const medicalRecordContract = getContract({ client, chain: monadTestnet, address: MEDICAL_RECORD_ADDRESS })
const auditTrailContract = getContract({ client, chain: monadTestnet, address: AUDIT_TRAIL_ADDRESS })

export interface MedicalRecordData {
  id: number
  patientAddress: string
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
  modality: string
  bodyPart: string
  studyDate: number
  department: string
  uploadedBy: string
  dicomCID: string
  keyEnvelopeCID: string
  fileHash: string
  uploadedAt: number
  isActive: boolean
}

export interface UploadRecordParams {
  patientAddress: string
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
  modality: 'CT' | 'XRAY'
  bodyPart: string
  studyDate: number
  department: string
  dicomCID: string
  keyEnvelopeCID: string
  fileHash: string
}

export interface AuditEntry {
  id: number
  action: string
  performedBy: string
  targetRecordId: number
  targetUser: string
  timestamp: number
  department: string
  details: string
}

// ─── UserRegistry: Read ───────────────────────────────────────────────────────

export async function getUserRole(address: string): Promise<number> {
  try {
    const role = await readContract({
      contract: userRegistryContract,
      method: 'function getRole(address userAddress) view returns (uint8)',
      params: [address],
    })
    return Number(role)
  } catch (error) {
    console.error('Error fetching user role:', error)
    return 0
  }
}

export async function getUserProfile(address: string) {
  try {
    const result = await readContract({
      contract: userRegistryContract,
      method: 'function getUser(address userAddress) view returns (address walletAddress, uint8 role, string name, string department, uint256 registeredAt, bool isActive, address registeredBy)',
      params: [address],
    })
    const [walletAddress, role, name, department, registeredAt, isActive, registeredBy] = result as any[]
    return {
      address: walletAddress as string,
      role: Number(role),
      name: name as string,
      department: department as string,
      registeredAt: Number(registeredAt),
      isActive: isActive as boolean,
      registeredBy: registeredBy as string,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function getDepartmentDoctors(department: string): Promise<string[]> {
  try {
    const result = await readContract({
      contract: userRegistryContract,
      method: 'function getDepartmentDoctors(string department) view returns (address[])',
      params: [department],
    })
    return result as string[]
  } catch (error) {
    console.error('Error fetching department doctors:', error)
    return []
  }
}

export async function getAllUsers(): Promise<Array<{
  address: string
  role: number
  name: string
  department: string
  registeredAt: number
  isActive: boolean
  registeredBy: string
}>> {
  try {
    const events = await getContractEvents({
      contract: userRegistryContract,
      events: [
        prepareEvent({
          signature: 'event UserRegistered(address indexed userAddress, uint8 role, string department, uint256 timestamp)',
        }),
      ],
      fromBlock: BigInt(0),
    })
    const uniqueAddresses = Array.from(new Set(events.map((e: any) => e.args.userAddress as string)))
    const profiles = await Promise.all(uniqueAddresses.map(addr => getUserProfile(addr)))
    return profiles
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map(p => ({
        address: p.address,
        role: p.role,
        name: p.name,
        department: p.department,
        registeredAt: p.registeredAt,
        isActive: p.isActive,
        registeredBy: p.registeredBy,
      }))
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

// ─── UserRegistry: Write ──────────────────────────────────────────────────────

export async function registerUser(
  params: { userAddress: string; role: number; name: string; department: string },
  account: Account
): Promise<string> {
  const transaction = prepareContractCall({
    contract: userRegistryContract,
    method: 'function registerUser(address userAddress, uint8 role, string name, string department)',
    params: [params.userAddress, params.role, params.name, params.department],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

export async function revokeUser(userAddress: string, account: Account): Promise<string> {
  const transaction = prepareContractCall({
    contract: userRegistryContract,
    method: 'function revokeUser(address userAddress)',
    params: [userAddress],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

// ─── MedicalRecord: Write ─────────────────────────────────────────────────────

export async function uploadRecord(
  params: UploadRecordParams,
  account: Account
): Promise<{ recordId: number; txHash: string }> {
  const transaction = prepareContractCall({
    contract: medicalRecordContract,
    method: 'function uploadRecord((address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, string dicomCID, string keyEnvelopeCID, string fileHash) params) returns (uint256 recordId)',
    params: [{
      patientAddress: params.patientAddress,
      encryptedPatientName: params.encryptedPatientName,
      encryptedPatientId: params.encryptedPatientId,
      encryptedBirthDate: params.encryptedBirthDate,
      modality: params.modality,
      bodyPart: params.bodyPart,
      studyDate: BigInt(params.studyDate),
      department: params.department,
      dicomCID: params.dicomCID,
      keyEnvelopeCID: params.keyEnvelopeCID,
      fileHash: params.fileHash,
    }],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  const newTotal = await readContract({
    contract: medicalRecordContract,
    method: 'function totalRecords() view returns (uint256)',
    params: [],
  })
  return { recordId: Number(newTotal), txHash: transactionHash }
}

export async function grantAccess(recordId: number, doctorAddress: string, account: Account): Promise<string> {
  const transaction = prepareContractCall({
    contract: medicalRecordContract,
    method: 'function grantAccess(uint256 recordId, address doctorAddress)',
    params: [BigInt(recordId), doctorAddress],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

export async function grantDepartmentAccess(recordId: number, department: string, account: Account): Promise<string> {
  const transaction = prepareContractCall({
    contract: medicalRecordContract,
    method: 'function grantDepartmentAccess(uint256 recordId, string department)',
    params: [BigInt(recordId), department],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

export async function revokeRecordAccess(recordId: number, doctorAddress: string, account: Account): Promise<string> {
  const transaction = prepareContractCall({
    contract: medicalRecordContract,
    method: 'function revokeAccess(uint256 recordId, address doctorAddress)',
    params: [BigInt(recordId), doctorAddress],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  return transactionHash
}

// ─── MedicalRecord: Read ──────────────────────────────────────────────────────

function mapRecordResult(result: any, id: number): MedicalRecordData {
  return {
    id,
    patientAddress: result[1] ?? '',
    encryptedPatientName: result[2] ?? '',
    encryptedPatientId: result[3] ?? '',
    encryptedBirthDate: result[4] ?? '',
    modality: result[5] ?? '',
    bodyPart: result[6] ?? '',
    studyDate: Number(result[7] ?? 0),
    department: result[8] ?? '',
    uploadedBy: result[9] ?? '',
    dicomCID: result[10] ?? '',
    keyEnvelopeCID: result[11] ?? '',
    fileHash: result[12] ?? '',
    uploadedAt: Number(result[13] ?? 0),
    isActive: result[14] ?? false,
  }
}

export async function getRecord(recordId: number): Promise<MedicalRecordData | null> {
  try {
    const result = await readContract({
      contract: medicalRecordContract,
      method: 'function getRecord(uint256 recordId) view returns (uint256 id, address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, address uploadedBy, string dicomCID, string keyEnvelopeCID, string fileHash, uint256 uploadedAt, bool isActive)',
      params: [BigInt(recordId)],
    })
    return mapRecordResult(result, recordId)
  } catch (error) {
    console.error(`Error fetching record #${recordId}:`, error)
    return null
  }
}

export async function getPatientRecords(patientAddress: string): Promise<MedicalRecordData[]> {
  try {
    const ids = await readContract({
      contract: medicalRecordContract,
      method: 'function getPatientRecords(address patientAddress) view returns (uint256[])',
      params: [patientAddress],
    })
    const records = await Promise.all((ids as bigint[]).map(id => getRecord(Number(id))))
    return records.filter((r): r is MedicalRecordData => r !== null)
  } catch (error) {
    console.error('Error fetching patient records:', error)
    return []
  }
}

export async function hasRecordAccess(recordId: number, userAddress: string): Promise<boolean> {
  try {
    const result = await readContract({
      contract: medicalRecordContract,
      method: 'function hasAccess(uint256 recordId, address userAddress) view returns (bool)',
      params: [BigInt(recordId), userAddress],
    })
    return Boolean(result)
  } catch (error) {
    console.error('Error checking record access:', error)
    return false
  }
}

// ─── AuditTrail: Write ────────────────────────────────────────────────────────

export async function logAction(
  params: { action: string; targetRecordId: number; targetUser: string; details: string },
  account: Account
): Promise<{ entryId: number; txHash: string }> {
  const transaction = prepareContractCall({
    contract: auditTrailContract,
    method: 'function logAction(string action, uint256 targetRecordId, address targetUser, string details) returns (uint256 entryId)',
    params: [params.action, BigInt(params.targetRecordId), params.targetUser, params.details],
  })
  const { transactionHash } = await sendTransaction({ transaction, account })
  await waitForReceipt({ client, chain: monadTestnet, transactionHash })
  const newTotal = await readContract({
    contract: auditTrailContract,
    method: 'function totalEntries() view returns (uint256)',
    params: [],
  })
  return { entryId: Number(newTotal), txHash: transactionHash }
}

// ─── AuditTrail: Read ─────────────────────────────────────────────────────────

function mapAuditEntry(result: any): AuditEntry {
  return {
    id: Number(result.id ?? result[0]),
    action: result.action ?? result[1],
    performedBy: result.performedBy ?? result[2],
    targetRecordId: Number(result.targetRecordId ?? result[3]),
    targetUser: result.targetUser ?? result[4],
    timestamp: Number(result.timestamp ?? result[5]),
    department: result.department ?? result[6],
    details: result.details ?? result[7],
  }
}

export async function getTotalAuditEntries(): Promise<number> {
  try {
    const result = await readContract({
      contract: auditTrailContract,
      method: 'function totalEntries() view returns (uint256)',
      params: [],
    })
    return Number(result)
  } catch (error) {
    console.error('Error fetching total audit entries:', error)
    return 0
  }
}

export async function getAuditEntry(entryId: number): Promise<AuditEntry | null> {
  try {
    const result = await readContract({
      contract: auditTrailContract,
      method: 'function getEntry(uint256 entryId) view returns ((uint256 id, string action, address performedBy, uint256 targetRecordId, address targetUser, uint256 timestamp, string department, string details))',
      params: [BigInt(entryId)],
    })
    return mapAuditEntry(result)
  } catch (error) {
    console.error(`Error fetching audit entry #${entryId}:`, error)
    return null
  }
}

export async function getAuditLogs(from: number, to: number): Promise<AuditEntry[]> {
  try {
    const result = await readContract({
      contract: auditTrailContract,
      method: 'function getAuditLog(uint256 from, uint256 to) view returns ((uint256 id, string action, address performedBy, uint256 targetRecordId, address targetUser, uint256 timestamp, string department, string details)[])',
      params: [BigInt(from), BigInt(to)],
    })
    return (result as any[]).map(mapAuditEntry)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

export async function getUserAuditLogs(userAddress: string): Promise<AuditEntry[]> {
  try {
    const ids = await readContract({
      contract: auditTrailContract,
      method: 'function getUserAuditLog(address userAddress) view returns (uint256[])',
      params: [userAddress],
    })
    const entries = await Promise.all((ids as bigint[]).map(id => getAuditEntry(Number(id))))
    return entries.filter((e): e is AuditEntry => e !== null)
  } catch (error) {
    console.error('Error fetching user audit logs:', error)
    return []
  }
}

export async function getRecordAuditLogs(recordId: number): Promise<AuditEntry[]> {
  try {
    const ids = await readContract({
      contract: auditTrailContract,
      method: 'function getRecordAuditLog(uint256 recordId) view returns (uint256[])',
      params: [BigInt(recordId)],
    })
    const entries = await Promise.all((ids as bigint[]).map(id => getAuditEntry(Number(id))))
    return entries.filter((e): e is AuditEntry => e !== null)
  } catch (error) {
    console.error('Error fetching record audit logs:', error)
    return []
  }
}
