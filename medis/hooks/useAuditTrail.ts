'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { getAuditLogs, getUserAuditLogs, logAction as logContractAction } from '@/lib/blockchain/contracts'
import { toastError } from '@/lib/utils'

export interface AuditFilter {
  action?: string
  fromTime?: number
  toTime?: number
  department?: string
  userAddress?: string
}

export function useAuditTrail() {
  const account = useActiveAccount()
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalEntries, setTotalEntries] = useState(0)

  const fetchLogs = async (filters?: AuditFilter) => {
    setIsLoading(true)
    try {
      // Mock fetch
      await new Promise(res => setTimeout(res, 800))
      // let data = filters?.userAddress ? await getUserAuditLogs(filters.userAddress) : await getAuditLogs(0, Date.now())
      setLogs([])
      setTotalEntries(0)
    } catch (error) {
      toastError("Failed to fetch audit logs", error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const logAction = async (action: string, targetRecordId: string, targetUser: string, details: string) => {
    if (!account) return
    try {
      // await logContractAction({ action, targetRecordId, targetUser, details }, account)
      console.log("Action logged:", action, details)
    } catch (error) {
      console.error("Failed to log action stealthily", error)
    }
  }

  return {
    logs,
    isLoading,
    totalEntries,
    fetchLogs,
    logAction
  }
}
