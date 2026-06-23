'use client'

import { useState, useRef, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useRole } from '@/hooks/useRole'
import { useEncryption } from '@/hooks/useEncryption'
import { uploadRecord } from '@/lib/blockchain/contracts'
import { DEPARTMENTS, MODALITY_OPTIONS, MAX_FILE_SIZE_BYTES } from '@/constants'
import {
  Upload, FileImage, X, CheckCircle, AlertCircle,
  ExternalLink, Lock, Shield, ChevronRight
} from 'lucide-react'

const EXPLORER = 'https://testnet.monadexplorer.com'

export default function UploadPage() {
  const account = useActiveAccount()
  const { userProfile } = useRole()
  const { encryptAndUpload, isProcessing, progress, steps, error } = useEncryption()

  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [result, setResult] = useState<{ txHash: string; dicomCID: string; keyEnvelopeCID: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [form, setForm] = useState({
    patientName: '',
    patientId: '',
    birthDate: '',
    studyDate: new Date().toISOString().split('T')[0],
    modality: 'CT',
    bodyPart: '',
    department: userProfile?.department || '',
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setFileError('')
    setResult(null)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File exceeds 100MB limit.')
      return
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!['.dcm', '.jpg', '.jpeg', '.png'].includes(ext)) {
      setFileError('Unsupported format. Use .dcm, .jpg, or .png')
      return
    }
    setSelectedFile(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleSubmit = async () => {
    if (!selectedFile || !account) return
    setIsUploading(true)
    setResult(null)

    try {
      const encResult = await encryptAndUpload(
        selectedFile,
        { patientName: form.patientName, patientId: form.patientId, birthDate: form.birthDate },
        form.department
      )
      if (!encResult) throw new Error('Encryption failed')

      const studyDateTs = Math.floor(new Date(form.studyDate).getTime() / 1000)
      const { recordId, txHash } = await uploadRecord(
        {
          patientAddress: account.address,
          encryptedPatientName: encResult.encryptedMetadata.encryptedPatientName,
          encryptedPatientId: encResult.encryptedMetadata.encryptedPatientId,
          encryptedBirthDate: encResult.encryptedMetadata.encryptedBirthDate,
          modality: form.modality,
          bodyPart: form.bodyPart,
          studyDate: studyDateTs,
          department: form.department,
          dicomCID: encResult.dicomCID,
          keyEnvelopeCID: encResult.keyEnvelopeCID,
          fileHash: encResult.fileHash,
        },
        account as any
      )

      setResult({ txHash, dicomCID: encResult.dicomCID, keyEnvelopeCID: encResult.keyEnvelopeCID })
    } catch (err: any) {
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const isFormValid = selectedFile && form.patientName && form.patientId &&
    form.birthDate && form.studyDate && form.bodyPart && form.department && !isProcessing && !isUploading

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>Staff</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">Upload Record</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Upload DICOM Record</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          File akan dienkripsi dengan NJCS sebelum disimpan di IPFS dan Monad Testnet
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-[#185FA5] bg-[#E6F1FB] scale-[1.01]'
          : selectedFile ? 'border-[#1D9E75] bg-[#E1F5EE]'
          : 'border-gray-200 hover:border-[#185FA5]/40 hover:bg-gray-50/50'
        }`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".dcm,.jpg,.jpeg,.png"
          className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center">
              <FileImage className="w-6 h-6 text-[#1D9E75]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to encrypt
              </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setResult(null) }}
              className="ml-2 p-1.5 rounded-lg hover:bg-white/60 transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Drop file here or click to browse</p>
            <p className="text-xs text-gray-400">Supports .dcm, .jpg, .png — max 100MB</p>
          </div>
        )}

        {fileError && (
          <p className="text-xs text-[#A32D2D] mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {fileError}
          </p>
        )}
      </div>

      {/* Patient & Study Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-900">Patient & Study Information</h2>
          <p className="text-xs text-gray-400 mt-0.5">Data sensitif akan dienkripsi sebelum disimpan on-chain</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Patient Full Name <span className="text-[#A32D2D]">*</span></label>
            <input type="text" placeholder="Nama lengkap pasien" value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Patient ID / NIK <span className="text-[#A32D2D]">*</span></label>
            <input type="text" placeholder="Nomor identitas pasien" value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Date of Birth <span className="text-[#A32D2D]">*</span></label>
            <input type="date" value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Study Date <span className="text-[#A32D2D]">*</span></label>
            <input type="date" value={form.studyDate}
              onChange={e => setForm(f => ({ ...f, studyDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Modality <span className="text-[#A32D2D]">*</span></label>
            <select value={form.modality} onChange={e => setForm(f => ({ ...f, modality: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] bg-white transition-colors">
              {MODALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Body Part Examined <span className="text-[#A32D2D]">*</span></label>
            <input type="text" placeholder="e.g. Brain, Chest, Knee" value={form.bodyPart}
              onChange={e => setForm(f => ({ ...f, bodyPart: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] transition-colors" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Department <span className="text-[#A32D2D]">*</span></label>
            <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] bg-white transition-colors">
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Encryption Log */}
      {(isProcessing || isUploading || steps.length > 0) && (
        <div className="bg-[#0d0d1a] rounded-xl overflow-hidden border border-gray-800">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#378ADD]" />
            <p className="text-xs text-gray-400 font-mono">NJCS Encryption Log</p>
            {isProcessing && (
              <div className="ml-auto w-3.5 h-3.5 border-2 border-gray-600 border-t-[#378ADD] rounded-full animate-spin" />
            )}
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {steps.map((step: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-xs font-mono">
                <span className={`mt-0.5 ${
                  step.status === 'completed' ? 'text-[#1D9E75]'
                  : step.status === 'in-progress' ? 'text-[#BA7517]'
                  : 'text-gray-600'
                }`}>
                  {step.status === 'completed' ? '✓' : step.status === 'in-progress' ? '›' : '·'}
                </span>
                <div>
                  <span className={
                    step.status === 'completed' ? 'text-gray-300'
                    : step.status === 'in-progress' ? 'text-yellow-300'
                    : 'text-gray-600'
                  }>{step.label}</span>
                  {step.subDetails?.map((d: string, j: number) => (
                    <p key={j} className="text-gray-500 mt-0.5 pl-2">{d}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {isProcessing && (
            <div className="px-5 pb-4">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#185FA5] to-[#378ADD] transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 font-mono">{progress.toFixed(0)}% complete</p>
            </div>
          )}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2.5 border-b border-[#1D9E75]/20">
            <CheckCircle className="w-4 h-4 text-[#1D9E75]" />
            <p className="text-sm font-semibold text-[#085041]">Upload Successful</p>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-24 shrink-0">Transaction</span>
              <span className="font-mono text-[#085041]">{result.txHash.slice(0,10)}...{result.txHash.slice(-6)}</span>
              <a href={`${EXPLORER}/tx/${result.txHash}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#185FA5] hover:underline ml-auto">
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-24 shrink-0">DICOM CID</span>
              <span className="font-mono text-[#085041] truncate">{result.dicomCID.slice(0,20)}...</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-24 shrink-0">Key Envelope</span>
              <span className="font-mono text-[#085041] truncate">{result.keyEnvelopeCID.slice(0,20)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#A32D2D] mt-0.5 shrink-0" />
          <p className="text-sm text-[#A32D2D]">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={!isFormValid}
        className="w-full flex items-center justify-center gap-2.5 bg-[#185FA5] hover:bg-[#164f8a] active:bg-[#123f72] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-all shadow-sm">
        {(isProcessing || isUploading) ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {isProcessing ? 'Encrypting...' : 'Uploading to blockchain...'}
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            Encrypt & Upload to Blockchain
          </>
        )}
      </button>

      {/* Security note */}
      <p className="text-center text-xs text-gray-400">
        File dienkripsi menggunakan New Jerk Chaotic System (NJCS) sebelum upload.
        Kunci enkripsi tidak pernah meninggalkan browser Anda.
      </p>
    </div>
  )
}
