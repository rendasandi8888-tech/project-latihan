'use client'

import Link from 'next/link'
import { useRole } from '@/hooks/useRole'
import { Upload, ClipboardList } from 'lucide-react'

export default function StaffPage() {
  const { userProfile } = useRole()
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">
          {userProfile ? `${userProfile.name} · ${userProfile.department}` : 'Loading...'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/staff/upload" className="mc-card p-6 hover:border-gray-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-lg bg-[#185FA5]/10 flex items-center justify-center mb-4 group-hover:bg-[#185FA5]/20 transition-colors">
            <Upload className="w-5 h-5 text-[#185FA5]" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Upload Record</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Encrypt and upload DICOM files to IPFS + Monad Testnet</p>
        </Link>
        <Link href="/audit-trail" className="mc-card p-6 hover:border-gray-200 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center mb-4 group-hover:bg-[#1D9E75]/20 transition-colors">
            <ClipboardList className="w-5 h-5 text-[#1D9E75]" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Audit Trail</h3>
          <p className="text-xs text-gray-400 leading-relaxed">View immutable activity log on the blockchain</p>
        </Link>
      </div>

      {userProfile && (
        <div className="mc-card p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Account Info</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Name', value: userProfile.name },
              { label: 'Department', value: userProfile.department },
              { label: 'Role', value: userProfile.role },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                <p className="text-sm font-medium text-gray-800">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
