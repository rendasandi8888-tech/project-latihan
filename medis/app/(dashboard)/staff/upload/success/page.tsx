'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle, ExternalLink, Upload, Home, Copy } from 'lucide-react'
import Link from 'next/link'
import { useState, Suspense } from 'react'

const EXPLORER = 'https://testnet.monadexplorer.com'

function SuccessContent() {
  const params = useSearchParams()
  const txHash = params.get('tx') || ''
  const dicomCID = params.get('dicom') || ''
  const keyCID = params.get('key') || ''
  const modality = params.get('modality') || ''
  const bodyPart = params.get('bodyPart') || ''
  const department = params.get('department') || ''
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#1D9E75]/10 to-[#185FA5]/10 px-8 py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1D9E75]/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#1D9E75]" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Record Successfully Uploaded</h1>
          <p className="text-sm text-gray-500 mt-2">
            File terenkripsi NJCS dan tersimpan permanen di Monad Testnet
          </p>
        </div>

        {(modality || bodyPart || department) && (
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-6 text-sm">
            {modality && (
              <div>
                <p className="text-xs text-gray-400">Modality</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  modality === 'CT' ? 'bg-[#E6F1FB] text-[#0C447C]' : 'bg-[#EAF3DE] text-[#27500A]'
                }`}>
                  {modality === 'CT' ? 'CT Scan' : 'X-Ray'}
                </span>
              </div>
            )}
            {bodyPart && (
              <div>
                <p className="text-xs text-gray-400">Body Part</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{bodyPart}</p>
              </div>
            )}
            {department && (
              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{department}</p>
              </div>
            )}
          </div>
        )}

        <div className="px-8 py-6 space-y-4">
          {txHash && (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                <p className="font-mono text-xs text-gray-700 truncate">{txHash}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => copy(txHash, 'tx')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <a href={`${EXPLORER}/tx/${txHash}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-[#185FA5] hover:underline">
                  Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
          {dicomCID && (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-1">DICOM CID (IPFS)</p>
                <p className="font-mono text-xs text-gray-700 truncate">{dicomCID}</p>
              </div>
              <button onClick={() => copy(dicomCID, 'dicom')}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )}
          {keyCID && (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-1">Key Envelope CID (IPFS)</p>
                <p className="font-mono text-xs text-gray-700 truncate">{keyCID}</p>
              </div>
              <button onClick={() => copy(keyCID, 'key')}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )}
          {copied && <p className="text-xs text-[#1D9E75] text-center">Copied!</p>}
        </div>
      </div>

      <div className="bg-[#0d0d1a] rounded-xl px-6 py-5 border border-gray-800">
        <p className="text-xs text-gray-400 font-mono mb-3">Encryption Summary</p>
        <div className="space-y-2 text-xs font-mono">
          {['NJCS Hyperchaotic parameters generated','Lyapunov exponents verified (hyperchaotic)','Patient metadata encrypted with NJCS','DICOM file encrypted with NJCS stream cipher','SHA-256 integrity hash stored on-chain','Key envelope stored on IPFS'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[#1D9E75]">✓</span>
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/staff/upload"
          className="flex items-center justify-center gap-2 bg-[#185FA5] hover:bg-[#164f8a] text-white rounded-xl py-3 text-sm font-semibold transition-colors">
          <Upload className="w-4 h-4" />
          Upload Another
        </Link>
        <Link href="/staff"
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-3 text-sm font-semibold transition-colors">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function UploadSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 text-sm py-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
