'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { uploadRecord, getRecord, getPatientRecords, grantDepartmentAccess, revokeUser } from '@/lib/blockchain/contracts' // Note: revokeAccess might be a different function depending on the exact contract method, mocked as revokeUser or a generic revoke for now
import { toastLoading, toastSuccess, toastError, toastBlockchain } from '@/lib/utils'

export function useMedicalRecord(recordId?: string) {
  const account = useActiveAccount()
  const [record, setRecord] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  const fetchRecord = async (id: string) => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      // Dummy check or actual smart contract call
      // const data = await getRecord(id)
      await new Promise(res => setTimeout(res, 800))
      const data = { id, data: "Mocked Record Data" } // Mock
      setRecord(data)
      setHasAccess(true)
    } catch (err) {
      setError(err as Error)
      setHasAccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatientRecords = async (patientAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(res => setTimeout(res, 800))
      // const data = await getPatientRecords(patientAddress)
      setRecords([]) // Mock empty array or mock data
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const uploadNewRecord = async (recordData: any) => {
    if (!account) throw new Error("Wallet not connected")
    setIsLoading(true)
    try {
      toastLoading("Uploading to IPFS and Monad Testnet...")
      // const txHash = await uploadRecord(recordData, account)
      await new Promise(res => setTimeout(res, 1500))
      const txHash = "0x" + Math.random().toString(16).substring(2, 40)
      toastBlockchain("Record uploaded successfully", txHash)
      return txHash
    } catch (err) {
      toastError("Failed to upload record", err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const grantAccess = async (recId: string, department: string) => {
    if (!account) throw new Error("Wallet not connected")
    setIsLoading(true)
    try {
      toastLoading(`Granting ${department} access...`)
      // const txHash = await grantDepartmentAccess(recId, department, account)
      await new Promise(res => setTimeout(res, 1000))
      const txHash = "0x" + Math.random().toString(16).substring(2, 40)
      toastBlockchain("Access granted", txHash)
      return txHash
    } catch (err) {
      toastError("Failed to grant access", err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Auto fetch if recordId provided
  // useEffect(() => { if (recordId) fetchRecord(recordId) }, [recordId])

  return {
    record,
    records,
    isLoading,
    error,
    hasAccess,
    fetchRecord,
    fetchPatientRecords,
    uploadNewRecord,
    grantAccess
  }
}
