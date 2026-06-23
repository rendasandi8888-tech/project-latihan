'use client'

import { useEffect, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useRole } from '@/hooks/useRole'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Users, Activity, Clock, ShieldCheck, ExternalLink, Eye } from 'lucide-react'
import Link from 'next/link'

const EXPLORER = 'https://testnet.monadexplorer.com'

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

export default function DoctorDashboard() {
  const account = useActiveAccount()
  const { userProfile } = useRole()
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const department = userProfile?.department || ''

  useEffect(() => {
    async function loadData() {
      if (!department) return
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
        const deptRecords: any[] = []

        for (let i = totalNum; i > Math.max(0, totalNum - 50) && i > 0; i--) {
          try {
            const rec = await readContract({
              contract: mrContract,
              method: 'function records(uint256) view returns (uint256 id, address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, address uploadedBy, string dicomCID, string keyEnvelopeCID, string fileHash, uint256 uploadedAt, bool isActive)',
              params: [BigInt(i)],
            })
            if (rec[8] === department) deptRecords.push(rec)
          } catch (_) { /* skip */ }
        }

        setRecords(deptRecords)
      } catch (err) {
        console.error('Failed to load doctor records:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [department])

  const patientSet = new Set(records.map(r => r[1]))
  const ctCount = records.filter(r => r[5] === 'CT').length
  const xrayCount = records.filter(r => r[5] === 'XRAY').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Doctor Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {department ? `Department: ${department}` : 'Loading department...'}
          </p>
        </div>
        <span className="text-xs bg-[#E6F1FB] text-[#0C447C] px-3 py-1.5 rounded-full font-medium">
          Access Level: Radiology Records
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Accessible Patients"
          value={isLoading ? '—' : patientSet.size}
          subtitle="In your department"
          icon={<Users className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="CT Scans"
          value={isLoading ? '—' : ctCount}
          subtitle="Accessible records"
          icon={<Activity className="w-5 h-5 text-[#185FA5]" />}
        />
        <MetricCard
          title="X-Rays"
          value={isLoading ? '—' : xrayCount}
          subtitle="Accessible records"
          icon={<Clock className="w-5 h-5 text-[#185FA5]" />}
        />
      </div>

      {/* Patient Records Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Patient Records</h2>
          <p className="text-xs text-gray-400 mt-0.5">Records accessible to your department</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#185FA5] rounded-full animate-spin" />
                Loading records from blockchain...
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No records accessible for your department yet.</p>
              <p className="text-xs text-gray-300 mt-1">Records will appear here once staff uploads them to your department.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Patient Wallet</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Body Part</th>
                  <th className="px-6 py-3 font-medium">Study Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((rec, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">
                      {maskAddress(rec[1] || '')}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec[5] === 'CT' ? 'bg-[#E6F1FB] text-[#0C447C]' : 'bg-[#EAF3DE] text-[#27500A]'
                      }`}>
                        {rec[5] === 'CT' ? 'CT Scan' : 'X-Ray'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{rec[6] || '—'}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(Number(rec[7]))}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E1F5EE] text-[#085041]">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/doctor/records/${rec[1]}`}
                        className="inline-flex items-center gap-1 text-xs text-[#185FA5] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Records
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
