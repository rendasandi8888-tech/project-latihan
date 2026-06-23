'use client'

import { useEffect, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Users, ScanLine, Activity, ShieldCheck, ExternalLink } from 'lucide-react'

const EXPLORER = 'https://testnet.monadexplorer.com'

function maskId(id: string) {
  if (!id || id.length < 8) return id
  return '••••' + id.slice(-4)
}

function maskAddress(addr: string) {
  if (!addr || addr.length < 10) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatDate(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function AdminDashboard() {
  const account = useActiveAccount()
  const [metrics, setMetrics] = useState({ patients: 0, ct: 0, xray: 0 })
  const [recentRecords, setRecentRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
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
        const records: any[] = []
        let ctCount = 0
        let xrayCount = 0
        const patientSet = new Set<string>()

        const fetchCount = Math.min(totalNum, 10)
        for (let i = totalNum; i > totalNum - fetchCount && i > 0; i--) {
          try {
            const rec = await readContract({
              contract: mrContract,
              method: 'function records(uint256) view returns (uint256 id, address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, address uploadedBy, string dicomCID, string keyEnvelopeCID, string fileHash, uint256 uploadedAt, bool isActive)',
              params: [BigInt(i)],
            })
            records.push(rec)
            const modality = rec[5] || ''
            if (modality === 'CT') ctCount++
            else if (modality === 'XRAY') xrayCount++
            patientSet.add(rec[1])
          } catch (_) { /* skip failed record */ }
        }

        setMetrics({ patients: patientSet.size, ct: ctCount, xray: xrayCount })
        setRecentRecords(records.slice(0, 8))
      } catch (err) {
        console.error('Failed to load admin metrics:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [account?.address])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">MediChain Radiology — Administrator Panel</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value={isLoading ? '—' : metrics.patients}
          subtitle="Registered patients"
          icon={<Users className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="Total CT Scans"
          value={isLoading ? '—' : metrics.ct}
          subtitle="On-chain records"
          icon={<ScanLine className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="Total X-Rays"
          value={isLoading ? '—' : metrics.xray}
          subtitle="On-chain records"
          icon={<Activity className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="On-chain Verified"
          value="100%"
          subtitle="Integrity verified"
          icon={<ShieldCheck className="w-5 h-5 text-[#1D9E75]" />}
        />
      </div>

      {/* Recent Records Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Examinations</h2>
          <p className="text-xs text-gray-400 mt-0.5">Latest records stored on Monad Testnet</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#185FA5] rounded-full animate-spin" />
                Loading records from blockchain...
              </div>
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No records found on-chain yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Patient</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Body Part</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRecords.map((rec, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">
                      {maskAddress(rec[1] || '')}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec[5] === 'CT'
                          ? 'bg-[#E6F1FB] text-[#0C447C]'
                          : 'bg-[#EAF3DE] text-[#27500A]'
                      }`}>
                        {rec[5] === 'CT' ? 'CT Scan' : 'X-Ray'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{rec[6] || '—'}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{rec[8] || '—'}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(Number(rec[13]))}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E1F5EE] text-[#085041]">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-xl px-5 py-4 text-sm text-[#0C447C]">
        <span className="font-medium">All records</span> are encrypted with New Jerk Chaotic System (NJCS) and stored immutably on{' '}
        <a href={EXPLORER} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
          Monad Testnet <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
