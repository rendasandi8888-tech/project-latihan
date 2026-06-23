'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { getRecord, hasRecordAccess } from '@/lib/blockchain/contracts'
import { useEncryption } from '@/hooks/useEncryption'
import { fetchDepartmentKey } from '@/lib/encryption/department-key-client'
import { toastError, toastSuccess } from '@/lib/utils'
import type { MedicalRecordData } from '@/lib/blockchain/contracts'

export default function DoctorPage() {
  const account = useActiveAccount()
  const { decryptAndDownload, isProcessing } = useEncryption()

  const [recordId, setRecordId] = useState('')
  const [record, setRecord] = useState<MedicalRecordData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!account) { setError('Wallet belum terkoneksi'); return }
    if (!recordId) { setError('Masukkan Record ID'); return }
    setError(null)
    setRecord(null)
    setIsLoading(true)
    try {
      const access = await hasRecordAccess(Number(recordId), account.address)
      if (!access) { setError('Wallet ini tidak memiliki akses ke record ini'); return }
      const data = await getRecord(Number(recordId))
      if (!data) { setError('Record tidak ditemukan'); return }
      setRecord(data)
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil record')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecryptDownload = async () => {
    if (!account || !record) return
    setIsDecrypting(true)
    try {
      const departmentKey = await fetchDepartmentKey(account.address)
      await decryptAndDownload(record.dicomCID, record.keyEnvelopeCID, departmentKey)
      toastSuccess('File berhasil didekripsi dan didownload')
    } catch (err: any) {
      toastError('Gagal dekripsi file', err)
    } finally {
      setIsDecrypting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Cari dan buka record pasien berdasarkan Record ID</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm">Cari Record</h2>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Masukkan Record ID (contoh: 1)"
            value={recordId}
            onChange={e => setRecordId(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !recordId}
            className="bg-[#185FA5] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#185FA5]/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      {record && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Record #{record.id}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${record.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {record.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium">Modality</p>
                <p className="text-gray-800 font-semibold">{record.modality}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Body Part</p>
                <p className="text-gray-800">{record.bodyPart}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Department</p>
                <p className="text-gray-800">{record.department}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium">Study Date</p>
                <p className="text-gray-800">{new Date(record.studyDate * 1000).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Uploaded At</p>
                <p className="text-gray-800">{new Date(record.uploadedAt * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Uploaded By</p>
                <p className="text-gray-600 font-mono text-xs">{record.uploadedBy.slice(0,8)}...{record.uploadedBy.slice(-6)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-2">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">DICOM CID (IPFS)</p>
              <p className="font-mono text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 break-all">{record.dicomCID}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">File Hash</p>
              <p className="font-mono text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 break-all">{record.fileHash}</p>
            </div>
          </div>

          <button
            onClick={handleDecryptDownload}
            disabled={isDecrypting || isProcessing}
            className="w-full bg-[#1D9E75] text-white font-semibold py-3 rounded-xl hover:bg-[#1D9E75]/90 disabled:opacity-50 transition-colors"
          >
            {isDecrypting ? 'Mendekripsi & Download...' : 'Dekripsi & Download File'}
          </button>
        </div>
      )}

      {!record && !isLoading && !error && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">Masukkan Record ID di atas untuk melihat detail record</p>
          <p className="text-gray-300 text-xs mt-1">Kamu hanya bisa mengakses record yang sudah di-grant aksesnya</p>
        </div>
      )}
    </div>
  )
}
