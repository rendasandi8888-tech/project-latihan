'use client'

import { useState, useRef, useCallback } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useRole } from '@/hooks/useRole'
import { useEncryption } from '@/hooks/useEncryption'
import { Upload, FileImage, X, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { DEPARTMENTS, MODALITY_OPTIONS, MAX_FILE_SIZE_BYTES } from '@/constants'

const EXPLORER = 'https://testnet.monadexplorer.com'

export default function UploadPage() {
  const account = useActiveAccount()
  const { userProfile } = useRole()
  const { encryptAndUpload, isProcessing, progress, steps, error } = useEncryption()

  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [txHash, setTxHash] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const [form, setForm] = useState({
    patientWallet: '',
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
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File too large. Maximum size is 100MB.`)
      return
    }
    const allowed = ['.dcm', '.jpg', '.jpeg', '.png']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowed.includes(ext)) {
      setFileError(`Unsupported file type. Please upload .dcm, .jpg, or .png`)
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile || !account) return
    setIsSuccess(false)
    setTxHash('')

    try {
      const result = await encryptAndUpload(
        selectedFile,
        {
          patientName: form.patientName,
          patientId: form.patientId,
          birthDate: form.birthDate,
        },
        form.department
      )

      if (result?.txHash) {
        setTxHash(result.txHash)
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const isFormValid =
    selectedFile &&
    form.patientWallet &&
    form.patientName &&
    form.patientId &&
    form.birthDate &&
    form.studyDate &&
    form.bodyPart &&
    form.department &&
    !isProcessing

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Upload DICOM Record</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Encrypt with NJCS and store on IPFS + Monad Testnet
        </p>
      </div>

      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-[#185FA5] bg-[#E6F1FB]'
            : selectedFile
            ? 'border-[#1D9E75] bg-[#E1F5EE]'
            : 'border-gray-200 hover:border-[#185FA5]/50 hover:bg-gray-50'
        }`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".dcm,.jpg,.jpeg,.png"
          className="hidden"
          onChange={onFileChange}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center">
              <FileImage className="w-5 h-5 text-[#1D9E75]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to encrypt
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              className="ml-2 p-1 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">Drop DICOM or image file here</p>
            <p className="text-xs text-gray-400 mt-1">Supports .dcm, .jpg, .png — max 100MB</p>
          </div>
        )}

        {fileError && (
          <p className="text-xs text-[#A32D2D] mt-2 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {fileError}
          </p>
        )}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Patient Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Patient Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={form.patientWallet}
              onChange={e => setForm(f => ({ ...f, patientWallet: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Patient Full Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Patient ID / NIK</label>
            <input
              type="text"
              placeholder="ID number"
              value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Study Date</label>
            <input
              type="date"
              value={form.studyDate}
              onChange={e => setForm(f => ({ ...f, studyDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Modality</label>
            <select
              value={form.modality}
              onChange={e => setForm(f => ({ ...f, modality: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5] bg-white"
            >
              {MODALITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Body Part Examined</label>
            <input
              type="text"
              placeholder="e.g. Brain, Chest, Knee"
              value={form.bodyPart}
              onChange={e => setForm(f => ({ ...f, bodyPart: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
            <select
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5] bg-white"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Encryption Progress */}
      {(isProcessing || steps.length > 0) && (
        <div className="bg-gray-950 rounded-xl p-5 space-y-2">
          <p className="text-xs text-gray-400 font-mono mb-3">NJCS Encryption Log</p>
          {steps.map((step: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs font-mono">
              <span className={step.status === 'completed' ? 'text-[#1D9E75]' : step.status === 'in-progress' ? 'text-[#BA7517]' : 'text-gray-600'}>
                {step.status === 'completed' ? '✓' : step.status === 'in-progress' ? '›' : '·'}
              </span>
              <div>
                <span className={step.status === 'completed' ? 'text-gray-300' : step.status === 'in-progress' ? 'text-yellow-300' : 'text-gray-600'}>
                  {step.label}
                </span>
                {step.subDetails?.map((d: string, j: number) => (
                  <p key={j} className="text-gray-500 mt-0.5 pl-2">{d}</p>
                ))}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="mt-3">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#185FA5] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">{progress.toFixed(0)}% encrypted</p>
            </div>
          )}
        </div>
      )}

      {/* Success */}
      {isSuccess && txHash && (
        <div className="bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#1D9E75]" />
            <p className="text-sm font-semibold text-[#085041]">Upload Successful</p>
          </div>
          <p className="text-xs text-[#085041] mb-2">Record encrypted and stored on IPFS + Monad Testnet.</p>
          <div className="flex items-center gap-2 font-mono text-xs text-[#085041]">
            <span className="text-gray-400">Tx:</span>
            <span>{txHash.slice(0, 10)}...{txHash.slice(-6)}</span>
            <a
              href={`${EXPLORER}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#185FA5] hover:underline"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#A32D2D] mt-0.5 shrink-0" />
          <p className="text-sm text-[#A32D2D]">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isFormValid}
        className="w-full flex items-center justify-center gap-2 bg-[#185FA5] hover:bg-[#164f8a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-sm font-semibold transition-colors"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Encrypting & Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Encrypt & Upload to Blockchain
          </>
        )}
      </button>
    </div>
  )
}
