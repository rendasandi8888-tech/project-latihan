'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { getPatientRecords } from '@/lib/blockchain/contracts'
import { useEncryption } from '@/hooks/useEncryption'
import { fetchDepartmentKey } from '@/lib/encryption/department-key-client'
import { toastError, toastSuccess } from '@/lib/utils'
import type { MedicalRecordData } from '@/lib/blockchain/contracts'
import { FileText, Download, Search, RefreshCw } from 'lucide-react'

export default function DoctorRecordsPage() {
  const account = useActiveAccount()
  const { decryptAndDownload, isProcessing } = useEncryption()
  const [patientAddress, setPatientAddress] = useState('')
  const [records, setRecords] = useState<MedicalRecordData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState<number | null>(null)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async () => {
    if (!account || !patientAddress) return
    setError(null); setRecords([]); setIsLoading(true); setSearched(true)
    try {
      const data = await getPatientRecords(patientAddress)
      setRecords(data)
      if (data.length === 0) setError('No records found for this patient, or you do not have access.')
    } catch (e: any) {
      setError(e.message || 'Failed to fetch records')
    } finally { setIsLoading(false) }
  }

  const decrypt = async (record: MedicalRecordData) => {
    if (!account) return
    setIsDecrypting(record.id)
    try {
      const key = await fetchDepartmentKey(account.address)
      await decryptAndDownload(record.dicomCID, record.keyEnvelopeCID, key)
      toastSuccess('File decrypted and downloaded')
    } catch (e: any) {
      toastError('Decryption failed', e)
    } finally { setIsDecrypting(null) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="page-title">Patient Records</h1>
        <p className="page-subtitle">Search all records belonging to a patient wallet</p>
      </div>

      <div className="mc-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Search by Patient Wallet</h2>
        <div className="flex gap-2">
          <input
            className="mc-input"
            placeholder="Patient wallet address (0x...)"
            value={patientAddress}
            onChange={e => setPatientAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button onClick={search} disabled={isLoading || !patientAddress} className="mc-btn-primary flex-shrink-0">
            <Search className="w-3.5 h-3.5" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {isLoading ? (
        <div className="mc-card p-10 flex justify-center"><div className="spinner" /></div>
      ) : records.length > 0 ? (
        <div className="mc-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              {records.length} record{records.length > 1 ? 's' : ''} found
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              {patientAddress.slice(0,8)}...{patientAddress.slice(-6)}
            </span>
          </div>
          <table className="mc-table">
            <thead><tr>
              <th className="mc-th">#</th>
              <th className="mc-th">Modality</th>
              <th className="mc-th">Body Part</th>
              <th className="mc-th">Department</th>
              <th className="mc-th">Study Date</th>
              <th className="mc-th">Status</th>
              <th className="mc-th" />
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="mc-tr">
                  <td className="mc-td font-mono text-xs text-gray-400">#{r.id}</td>
                  <td className="mc-td">
                    <span className="badge bg-blue-50 text-blue-700">{r.modality}</span>
                  </td>
                  <td className="mc-td text-gray-600">{r.bodyPart}</td>
                  <td className="mc-td text-gray-500 text-xs">{r.department}</td>
                  <td className="mc-td text-xs text-gray-500">
                    {new Date(r.studyDate * 1000).toLocaleDateString('id-ID')}
                  </td>
                  <td className="mc-td">
                    <span className={`badge ${r.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="mc-td text-right">
                    <button
                      onClick={() => decrypt(r)}
                      disabled={isDecrypting === r.id || isProcessing}
                      className="mc-btn-secondary text-xs py-1.5 px-3"
                    >
                      <Download className="w-3 h-3" />
                      {isDecrypting === r.id ? 'Decrypting...' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : searched && !isLoading && (
        <div className="mc-card p-12 text-center space-y-2">
          <FileText className="w-8 h-8 text-gray-200 mx-auto" />
          <p className="text-sm text-gray-400">No accessible records found</p>
          <p className="text-xs text-gray-300">You may not have been granted access to this patient&apos;s records</p>
        </div>
      )}

      {!searched && (
        <div className="mc-card p-12 text-center space-y-2">
          <Search className="w-8 h-8 text-gray-200 mx-auto" />
          <p className="text-sm text-gray-400">Enter a patient wallet address to search</p>
          <p className="text-xs text-gray-300">Only records you have access to will be shown</p>
        </div>
      )}
    </div>
  )
}
