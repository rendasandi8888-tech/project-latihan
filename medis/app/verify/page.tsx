'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, Search, CheckCircle2, XCircle, FileText, Download, ExternalLink, Loader2 } from 'lucide-react'

interface VerifyResult {
  isValid: boolean
  modality?: string
  date?: string
  department?: string
  uploadedBy?: string
  blockNumber?: number
  timestamp?: string
}

export default function PublicVerificationPage() {
  const searchParams = useSearchParams()
  const urlTx = searchParams?.get('tx')

  const [inputValue, setInputValue] = useState(urlTx || '')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)

  useEffect(() => {
    if (urlTx) {
      handleVerify(urlTx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTx])

  const handleVerify = async (hash: string) => {
    if (!hash) return
    setIsVerifying(true)
    setResult(null)

    try {
      // Mock blockchain verification delay
      await new Promise(res => setTimeout(res, 2000))
      
      // Simulate validation logic
      if (hash.startsWith('0x') && hash.length > 10) {
        setResult({
          isValid: true,
          modality: 'CT Scan',
          date: '2026-06-19',
          department: 'Radiology',
          uploadedBy: '0x123...4567',
          blockNumber: 1459203,
          timestamp: '2026-06-19 14:30:00 UTC'
        })
      } else {
        setResult({ isValid: false })
      }
    } catch (err) {
      setResult({ isValid: false })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#F0F7FF] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#185FA5] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Medical Record Authenticity</h1>
          <p className="text-gray-500">Powered by Monad Blockchain · No login required</p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Hash or IPFS CID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. 0x8f2d... or bafybeig..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] font-mono text-sm transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify(inputValue)}
              />
            </div>
            <button
              onClick={() => handleVerify(inputValue)}
              disabled={isVerifying || !inputValue}
              className="flex items-center justify-center gap-2 bg-[#185FA5] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#164f8a] disabled:opacity-70 transition-colors"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              Verify
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className={`rounded-2xl border-2 p-8 text-center bg-white shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${result.isValid ? 'border-[#1D9E75]' : 'border-[#A32D2D]'}`}>
            {result.isValid ? (
              <>
                <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#1D9E75]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentic Medical Record</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  This record is immutably stored on Monad Testnet and has not been tampered with.
                </p>

                <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Modality</p>
                    <p className="font-medium text-gray-900">{result.modality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Study Date</p>
                    <p className="font-medium text-gray-900">{result.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Department</p>
                    <p className="font-medium text-gray-900">{result.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Uploaded By</p>
                    <p className="font-mono text-sm text-[#185FA5]">{result.uploadedBy}</p>
                  </div>
                  <div className="col-span-2 pt-4 mt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Blockchain Info</p>
                    <p className="font-mono text-sm text-gray-600">Block #{result.blockNumber} · {result.timestamp}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://testnet.monadexplorer.com/tx/${inputValue}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    View on Monad Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                  <button className="flex items-center justify-center gap-2 bg-[#185FA5]/10 text-[#185FA5] px-6 py-2.5 rounded-lg font-medium hover:bg-[#185FA5]/20 transition-colors">
                    <Download className="w-4 h-4" /> Download Certificate PDF
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#A32D2D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-[#A32D2D]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-500 mb-6">
                  Record not found or has been tampered with. Please ensure the hash is correct.
                </p>
                <button
                  onClick={() => setResult(null)}
                  className="text-gray-500 hover:text-gray-700 font-medium underline"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
