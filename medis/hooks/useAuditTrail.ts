'use client'

import { useState } from 'react'

export interface AuditEntry {
  id: number
  action: string
  performedBy: string
  targetRecordId: number
  targetUser: string
  timestamp: number
  department: string
  details: string
  source?: string
}

export interface AuditFilter {
  action?: string
  department?: string
  fromTime?: number
  toTime?: number
}

export function useAuditTrail() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalEntries, setTotalEntries] = useState(0)

  const fetchLogs = async (filters?: AuditFilter) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/audit/read')
      const data = await res.json()

      let filtered: AuditEntry[] = data.logs || []

      if (filters?.action) filtered = filtered.filter(l => l.action === filters.action)
      if (filters?.department) filtered = filtered.filter(l => l.department === filters.department)
      if (filters?.fromTime) filtered = filtered.filter(l => l.timestamp >= filters.fromTime!)
      if (filters?.toTime) filtered = filtered.filter(l => l.timestamp <= filters.toTime!)

      setLogs(filtered)
      setTotalEntries(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const logAction = async (
    action: string,
    performedBy: string,
    targetRecordId: number,
    targetUser: string,
    department: string,
    details: string
  ) => {
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, performedBy, targetRecordId, targetUser, department, details }),
      })
    } catch (err) {
      console.warn('[AuditTrail] Failed to log:', err)
    }
  }

  return { logs, isLoading, totalEntries, fetchLogs, logAction }
}
