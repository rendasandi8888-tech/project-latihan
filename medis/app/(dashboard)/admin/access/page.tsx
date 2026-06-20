'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Key, Trash2, Plus, Loader2 } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { getRecord, grantDepartmentAccess, getPatientRecords, getAllUsers } from '@/lib/blockchain/contracts'
import { toastSuccess, toastError, toastLoading, toastBlockchain } from '@/lib/utils'

// Mock records for demo, ideally fetched via smart contract
const mockRecords = [
  { id: "REC-1234", patientId: "0xPat...1234", department: "Radiology", date: "2026-06-15", hasAccess: ["Emergency", "Surgery"] },
  { id: "REC-5678", patientId: "0xPat...5678", department: "Radiology", date: "2026-06-18", hasAccess: ["Oncology"] },
]

export default function AccessManagementPage() {
  const account = useActiveAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [records, setRecords] = useState(mockRecords)
  
  // This would be replaced with real fetching logic in a production env
  useEffect(() => {
    // Simulate loading data from blockchain
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleGrantAccess = async (recordId: string, dept: string) => {
    if (!account) return toastError("Wallet not connected")
    
    try {
      toastLoading(`Granting ${dept} access to ${recordId}...`)
      // Mock contract call
      // const tx = await grantDepartmentAccess(recordId, dept, account)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 40)
      
      toastBlockchain(`Access granted to ${dept}`, mockTxHash)
      
      // Update UI optimistically
      setRecords(prev => prev.map(r => {
        if (r.id === recordId && !r.hasAccess.includes(dept)) {
          return { ...r, hasAccess: [...r.hasAccess, dept] }
        }
        return r
      }))
    } catch (error) {
      toastError("Failed to grant access", error as Error)
    }
  }

  const handleRevokeAccess = async (recordId: string, dept: string) => {
    if (!account) return toastError("Wallet not connected")
    
    try {
      toastLoading(`Revoking ${dept} access from ${recordId}...`)
      // Mock contract call for revoke
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 40)
      
      toastBlockchain(`Access revoked for ${dept}`, mockTxHash)
      
      // Update UI optimistically
      setRecords(prev => prev.map(r => {
        if (r.id === recordId) {
          return { ...r, hasAccess: r.hasAccess.filter(d => d !== dept) }
        }
        return r
      }))
    } catch (error) {
      toastError("Failed to revoke access", error as Error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Management</h1>
          <p className="text-sm text-gray-500">Manage cross-department access to medical records.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Record ID</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Origin Dept</th>
                <th className="px-6 py-4 font-medium">Granted Access</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#185FA5] mx-auto mb-2" />
                    <p className="text-gray-500">Loading access data from Monad Testnet...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-medium text-[#185FA5]">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {record.patientId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                        {record.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {record.hasAccess.map(dept => (
                          <span key={dept} className="inline-flex items-center gap-1 bg-[#1D9E75]/10 text-[#1D9E75] px-2 py-0.5 rounded text-xs">
                            <Shield className="w-3 h-3" />
                            {dept}
                            <button 
                              onClick={() => handleRevokeAccess(record.id, dept)}
                              className="ml-1 hover:text-red-500 transition-colors"
                              title="Revoke Access"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {record.hasAccess.length === 0 && <span className="text-gray-400 text-xs italic">No external access</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          const newDept = prompt("Enter department to grant access to (e.g. Surgery, Oncology, Emergency):")
                          if (newDept) handleGrantAccess(record.id, newDept)
                        }}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-xs font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Grant
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
