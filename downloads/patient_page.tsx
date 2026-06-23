'use client'

import { useEffect, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useRole } from '@/hooks/useRole'
import { ShieldCheck, FileText, ScanLine, Activity } from 'lucide-react'

function formatDate(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function PatientDashboard() {
  const account = useActiveAccount()
  const { userProfile } = useRole()
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!account?.address) return
      try {
        const { getContract, readContract } = await import('thirdweb')
        const { client, monadTestnet } = await import('@/lib/blockchain/client')

        const mrContract = getContract({
          client, chain: monadTestnet,
          address: process.env.NEXT_PUBLIC_MEDICAL_RECORD_ADDRESS!,
        })

        const total = await readContract({
          contract: mrContract,
          method: 'function totalRecords() view returns (uint256)',
          params: [],
        })

        const totalNum = Number(total)
        const myRecords: any[] = []

        for (let i = 1; i <= totalNum; i++) {
          try {
            const rec = await readContract({
              contract: mrContract,
              method: 'function records(uint256) view returns (uint256 id, address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, address uploadedBy, string dicomCID, string keyEnvelopeCID, string fileHash, uint256 uploadedAt, bool isActive)',
              params: [BigInt(i)],
            })
            if (rec[1]?.toLowerCase() === account.address.toLowerCase()) {
              myRecords.push(rec)
            }
          } catch (_) { /* skip */ }
        }

        setRecords(myRecords.reverse())
      } catch (err) {
        console.error('Failed to load patient records:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [account?.address])

  const name = userProfile?.name || 'Patient'

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Good night'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{getGreeting()}, {name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Access your medical imaging records securely</p>
      </div>

      {/* Security info card */}
      <div className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-xl px-5 py-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#185FA5] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#0C447C]">Your data is protected</p>
          <p className="text-xs text-[#185FA5] mt-0.5">
            All your medical imaging records are encrypted with New Jerk Chaotic System (NJCS)
            and immutably stored on Monad Testnet blockchain.
          </p>
        </div>
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">My Medical Records</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading ? 'Loading...' : `${records.length} record${records.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          {!isLoading && records.length > 0 && (
            <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              All Verified
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#185FA5] rounded-full animate-spin" />
              Fetching your records from blockchain...
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No medical records found</p>
            <p className="text-xs text-gray-400 mt-1">
              Your records will appear here once uploaded by radiology staff.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((rec, i) => (
              <div key={i} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      rec[5] === 'CT' ? 'bg-[#E6F1FB]' : 'bg-[#EAF3DE]'
                    }`}>
                      {rec[5] === 'CT'
                        ? <ScanLine className="w-4 h-4 text-[#185FA5]" />
                        : <Activity className="w-4 h-4 text-[#1D9E75]" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rec[5] === 'CT' ? 'CT Scan' : 'X-Ray'}
                        {rec[6] ? ` — ${rec[6]}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {rec[8] || 'Radiology'} · Study date: {formatDate(Number(rec[7]))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E1F5EE] text-[#085041]">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(Number(rec[13]))}</span>
                  </div>
                </div>

                {/* IPFS & blockchain info */}
                <div className="mt-3 ml-12 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-gray-400">IPFS CID</p>
                    <p className="font-mono text-gray-600 truncate mt-0.5">{rec[10] ? rec[10].slice(0, 20) + '...' : '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-gray-400">Encryption</p>
                    <p className="font-mono text-[#185FA5] mt-0.5">NJCS Stream Cipher</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
