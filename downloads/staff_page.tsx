'use client'

import { useEffect, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useRole } from '@/hooks/useRole'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Upload, FileText, Calendar, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function formatDate(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function maskAddress(addr: string) {
  if (!addr || addr.length < 10) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function StaffDashboard() {
  const account = useActiveAccount()
  const { userProfile } = useRole()
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const today = now.toDateString()

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
        const myUploads: any[] = []

        for (let i = totalNum; i > Math.max(0, totalNum - 100) && i > 0; i--) {
          try {
            const rec = await readContract({
              contract: mrContract,
              method: 'function records(uint256) view returns (uint256 id, address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, address uploadedBy, string dicomCID, string keyEnvelopeCID, string fileHash, uint256 uploadedAt, bool isActive)',
              params: [BigInt(i)],
            })
            if (rec[9]?.toLowerCase() === account.address.toLowerCase()) {
              myUploads.push(rec)
            }
          } catch (_) { /* skip */ }
        }

        setUploads(myUploads)
      } catch (err) {
        console.error('Failed to load staff uploads:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [account?.address])

  const thisMonthCount = uploads.filter(r => {
    const d = new Date(Number(r[13]) * 1000)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length

  const todayCount = uploads.filter(r => {
    return new Date(Number(r[13]) * 1000).toDateString() === today
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Staff Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {userProfile?.department ? `Department: ${userProfile.department}` : 'Upload and manage DICOM records'}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Uploads"
          value={isLoading ? '—' : uploads.length}
          subtitle="All time"
          icon={<FileText className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="This Month"
          value={isLoading ? '—' : thisMonthCount}
          subtitle="Uploads this month"
          icon={<Calendar className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="Today"
          value={isLoading ? '—' : todayCount}
          subtitle="Uploads today"
          icon={<Upload className="w-5 h-5 text-[#1D9E75]" />}
        />
      </div>

      {/* CTA Upload */}
      <Link
        href="/staff/upload"
        className="flex items-center justify-between w-full bg-[#185FA5] hover:bg-[#164f8a] text-white rounded-xl px-6 py-5 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Upload New DICOM Record</p>
            <p className="text-sm text-blue-100 mt-0.5">Encrypt and store on IPFS + Monad Testnet</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Info box */}
      <div className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-xl px-5 py-3 text-sm text-[#0C447C] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        All uploads are encrypted with New Jerk Chaotic System (NJCS) before being stored on IPFS and Monad Testnet.
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Uploads</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your 5 most recent uploads</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#185FA5] rounded-full animate-spin" />
              Loading from blockchain...
            </div>
          </div>
        ) : uploads.length === 0 ? (
          <div className="p-12 text-center">
            <Upload className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No uploads yet.</p>
            <p className="text-xs text-gray-300 mt-1">Start by uploading a DICOM record above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Record ID</th>
                  <th className="px-6 py-3 font-medium">Patient</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {uploads.slice(0, 5).map((rec, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">#{Number(rec[0])}</td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{maskAddress(rec[1])}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec[5] === 'CT' ? 'bg-[#E6F1FB] text-[#0C447C]' : 'bg-[#EAF3DE] text-[#27500A]'
                      }`}>
                        {rec[5] === 'CT' ? 'CT Scan' : 'X-Ray'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(Number(rec[13]))}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E1F5EE] text-[#085041]">
                        <ShieldCheck className="w-3 h-3" />
                        On-chain
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
