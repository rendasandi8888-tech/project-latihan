'use client'

import { useRole } from '@/hooks/useRole'
import { MONAD_TESTNET, ROLE_LABELS } from '@/constants'
import { User, Shield, Building2, Clock, ExternalLink } from 'lucide-react'

export default function ProfilePage() {
  const { userProfile, role, isLoading } = useRole()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your on-chain identity</p>
        </div>
        <div className="mc-card p-10 flex justify-center">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
        </div>
        <div className="mc-card p-10 text-center space-y-2">
          <User className="w-8 h-8 text-gray-200 mx-auto" />
          <p className="text-sm text-gray-400">Connect your wallet to view profile</p>
        </div>
      </div>
    )
  }

  const explorerUrl = MONAD_TESTNET.explorerUrl + '/address/' + userProfile.address

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your on-chain identity on Monad Testnet</p>
      </div>

      <div className="mc-card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#185FA5]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-[#185FA5]" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900">{userProfile.name || 'Unnamed User'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[role]} · {userProfile.department}</p>
            <span className={"badge mt-1.5 " + (userProfile.isActive ? 'badge-active' : 'badge-inactive')}>
              {userProfile.isActive ? 'Active' : 'Revoked'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Full Name</p>
            <p className="text-sm font-medium text-gray-800">{userProfile.name || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Role</p>
            <p className="text-sm font-medium text-gray-800">{ROLE_LABELS[role] || role}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Department</p>
            <p className="text-sm font-medium text-gray-800">{userProfile.department || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Registered At</p>
            <p className="text-sm font-medium text-gray-800">
              {userProfile.registeredAt
                ? new Date(userProfile.registeredAt * 1000).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="mc-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Wallet Address</h2>
        <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <p className="font-mono text-xs text-gray-600 break-all">{userProfile.address}</p>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 text-[#185FA5] hover:opacity-70 transition-opacity">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="mc-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Network</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Network</p>
            <p className="text-xs font-semibold text-gray-800">{MONAD_TESTNET.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Chain ID</p>
            <p className="text-xs font-semibold text-gray-800">{MONAD_TESTNET.chainId}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Currency</p>
            <p className="text-xs font-semibold text-gray-800">{MONAD_TESTNET.nativeCurrency.symbol}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
