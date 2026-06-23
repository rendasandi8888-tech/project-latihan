'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { getAllUsers, getAuditLogs, getTotalAuditEntries } from '@/lib/blockchain/contracts'
import { useRole } from '@/hooks/useRole'
import Link from 'next/link'
import { Users, ShieldCheck, ClipboardList, TrendingUp } from 'lucide-react'
import { AUDIT_ACTION_COLORS, AUDIT_ACTION_LABELS } from '@/constants'

export default function AdminPage() {
  const account = useActiveAccount()
  const { userProfile } = useRole()
  const [stats, setStats] = useState({ totalUsers: 0, doctors: 0, staff: 0, auditTotal: 0, activeUsers: 0 })
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!account) return
    async function load() {
      setIsLoading(true)
      try {
        const [users, total] = await Promise.all([getAllUsers(), getTotalAuditEntries()])
        const logs = total > 0 ? await getAuditLogs(Math.max(1, total - 4), total) : []
        setStats({
          totalUsers: users.length,
          doctors: users.filter(u => u.role === 2).length,
          staff: users.filter(u => u.role === 3).length,
          auditTotal: total,
          activeUsers: users.filter(u => u.isActive).length,
        })
        setRecentLogs([...logs].reverse())
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [account])

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.activeUsers} active`, icon: Users, color: '#185FA5' },
    { label: 'Doctors', value: stats.doctors, sub: 'registered', icon: TrendingUp, color: '#1D9E75' },
    { label: 'Staff', value: stats.staff, sub: 'registered', icon: Users, color: '#BA7517' },
    { label: 'Audit Entries', value: stats.auditTotal, sub: 'on-chain', icon: ClipboardList, color: '#534AB7' },
  ]

  const shortcuts = [
    { href: '/admin/users', label: 'Manage Users', desc: 'Register & revoke accounts', icon: Users, color: '#185FA5' },
    { href: '/admin/access', label: 'Access Control', desc: 'Grant & revoke record access', icon: ShieldCheck, color: '#1D9E75' },
    { href: '/audit-trail', label: 'Audit Trail', desc: 'Immutable activity log', icon: ClipboardList, color: '#534AB7' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          {userProfile?.name ? `Welcome back, ${userProfile.name}` : 'MediChain Radiology — Administrator Panel'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="mc-card p-5">
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-7 bg-gray-100 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              ) : (
                <>
                  <p className="stat-label">{c.label}</p>
                  <p className="stat-value mt-1.5" style={{ color: c.color }}>{c.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-4">
        {shortcuts.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}
              className="mc-card p-5 hover:border-gray-200 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: s.color + '15' }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#185FA5] transition-colors">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent activity */}
      <div className="mc-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
          <Link href="/audit-trail" className="text-xs text-[#185FA5] hover:underline">View all →</Link>
        </div>
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="spinner" /></div>
        ) : recentLogs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-400">No activity recorded yet</p>
            <p className="text-xs text-gray-300 mt-1">Activity will appear here after uploads and access grants</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`badge flex-shrink-0 ${AUDIT_ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{log.details || AUDIT_ACTION_LABELS[log.action] || log.action}</span>
                </div>
                <span className="text-[11px] text-gray-300 flex-shrink-0 ml-4">
                  {new Date(log.timestamp * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
