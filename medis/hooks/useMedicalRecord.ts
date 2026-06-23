'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import {
  getRecord,
  getPatientRecords,
  uploadRecord as uploadRecordToChain,
  grantDepartmentAccess,
  grantAccess,
  revokeRecordAccess,
  hasRecordAccess,
  getUserProfile,
  type MedicalRecordData,
  type UploadRecordParams,
} from '@/lib/blockchain/contracts'
import { writeAuditLog } from '@/lib/audit-client'
import { toastLoading, toastError, toastBlockchain } from '@/lib/utils'

export function useMedicalRecord(recordId?: string) {
  const account = useActiveAccount()
  const [record, setRecord] = useState<MedicalRecordData | null>(null)
  const [records, setRecords] = useState<MedicalRecordData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  const getDept = async (address: string) => {
    try {
      const p = await getUserProfile(address)
      return p?.department || 'Unknown'
    } catch { return 'Unknown' }
  }

  const fetchRecord = async (id: string) => {
    if (!id || !account) return
    setIsLoading(true); setError(null)
    try {
      const access = await hasRecordAccess(Number(id), account.address)
      setHasAccess(access)
      if (!access) { setError(new Error('No access to this record')); return }
      const data = await getRecord(Number(id))
      setRecord(data)
      const dept = await getDept(account.address)
      await writeAuditLog({ action: 'VIEW', performedBy: account.address, targetRecordId: Number(id), targetUser: data?.patientAddress, department: dept, details: `Viewed record #${id}` })
    } catch (err) {
      setError(err as Error)
      setHasAccess(false)
      toastError('Failed to fetch record', err as Error)
    } finally { setIsLoading(false) }
  }

  const fetchPatientRecords = async (patientAddress: string) => {
    setIsLoading(true); setError(null)
    try {
      const data = await getPatientRecords(patientAddress)
      setRecords(data)
    } catch (err) {
      setError(err as Error)
      toastError('Failed to fetch records', err as Error)
    } finally { setIsLoading(false) }
  }

  const uploadNewRecord = async (params: UploadRecordParams): Promise<{ recordId: number; txHash: string }> => {
    if (!account) throw new Error('Wallet not connected')
    setIsLoading(true)
    try {
      toastLoading('Recording on Monad Testnet...')
      const result = await uploadRecordToChain(params, account)
      toastBlockchain(`Record #${result.recordId} saved`, result.txHash)
      const dept = await getDept(account.address)
      await writeAuditLog({
        action: 'UPLOAD',
        performedBy: account.address,
        targetRecordId: result.recordId,
        targetUser: params.patientAddress,
        department: dept,
        details: `Uploaded ${params.modality} - ${params.bodyPart} to IPFS+Blockchain. TX: ${result.txHash.slice(0, 10)}...`,
      })
      return result
    } catch (err) {
      toastError('Failed to record on blockchain', err as Error)
      throw err
    } finally { setIsLoading(false) }
  }

  const grantAccessToUser = async (recId: string, doctorAddress: string): Promise<string> => {
    if (!account) throw new Error('Wallet not connected')
    setIsLoading(true)
    try {
      toastLoading('Granting access...')
      const txHash = await grantAccess(Number(recId), doctorAddress, account)
      toastBlockchain('Access granted', txHash)
      const dept = await getDept(account.address)
      await writeAuditLog({ action: 'GRANT_ACCESS', performedBy: account.address, targetRecordId: Number(recId), targetUser: doctorAddress, department: dept, details: `Granted access to record #${recId}` })
      return txHash
    } catch (err) {
      toastError('Failed to grant access', err as Error)
      throw err
    } finally { setIsLoading(false) }
  }

  const grantDepartmentAccessToRecord = async (recId: string, department: string): Promise<string> => {
    if (!account) throw new Error('Wallet not connected')
    setIsLoading(true)
    try {
      toastLoading(`Granting ${department} access...`)
      const txHash = await grantDepartmentAccess(Number(recId), department, account)
      toastBlockchain('Department access granted', txHash)
      const dept = await getDept(account.address)
      await writeAuditLog({ action: 'GRANT_ACCESS', performedBy: account.address, targetRecordId: Number(recId), targetUser: '0x0000000000000000000000000000000000000000', department: dept, details: `Granted department access: ${department} to record #${recId}` })
      return txHash
    } catch (err) {
      toastError('Failed to grant department access', err as Error)
      throw err
    } finally { setIsLoading(false) }
  }

  const revokeAccess = async (recId: string, doctorAddress: string): Promise<string> => {
    if (!account) throw new Error('Wallet not connected')
    setIsLoading(true)
    try {
      toastLoading('Revoking access...')
      const txHash = await revokeRecordAccess(Number(recId), doctorAddress, account)
      toastBlockchain('Access revoked', txHash)
      const dept = await getDept(account.address)
      await writeAuditLog({ action: 'REVOKE_ACCESS', performedBy: account.address, targetRecordId: Number(recId), targetUser: doctorAddress, department: dept, details: `Revoked access to record #${recId}` })
      return txHash
    } catch (err) {
      toastError('Failed to revoke access', err as Error)
      throw err
    } finally { setIsLoading(false) }
  }

  return {
    record, records, isLoading, error, hasAccess,
    fetchRecord, fetchPatientRecords, uploadNewRecord,
    grantAccessToUser, grantDepartmentAccessToRecord, revokeAccess,
  }
}
