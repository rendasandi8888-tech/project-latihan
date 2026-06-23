'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import {
  LayoutDashboard, Users, ShieldCheck, ClipboardList,
  Upload, FileText, User, Activity, ChevronRight
} from 'lucide-react'

const NAV: Record<string, { href: string; label: string; icon: any }[]> = {
  ADMIN: [
    { href: '/admin',        label: 'Dashboard',      icon: LayoutDashboard },
    { href: '/admin/users',  label: 'Manage Users',   icon: Users },
    { href: '/admin/access', label: 'Access Control', icon: ShieldCheck },
    { href: '/audit-trail',  label: 'Audit Trail',    icon: ClipboardList },
  ],
  DOCTOR: [
    { href: '/doctor',         label: 'Dashboard',       icon: LayoutDashboard },
    { href: '/doctor/records', label: 'Patient Records', icon: FileText },
    { href: '/audit-trail',    label: 'Audit Trail',     icon: ClipboardList },
    { href: '/profile',        label: 'Profile',         icon: User },
  ],
  STAFF: [
    { href: '/staff',        label: 'Dashboard',     icon: LayoutDashboard },
    { href: '/staff/upload', label: 'Upload Record', icon: Upload },
    { href: '/audit-trail',  label: 'Audit Trail',   icon: ClipboardList },
    { href: '/profile',      label: 'Profile',       icon: User },
  ],
  UNREGISTERED: [],
}

export function Sidebar() {
  const pathname = usePathname()
  const { role, userProfile, isLoading } = useRole()
  const items = NAV[role] ?? []

  const roleColor: Record<string, string> = {
    ADMIN: 'text-purple-600 bg-purple-50',
    DOCTOR: 'text-blue-600 bg-blue-50',
    STAFF: 'text-emerald-600 bg-emerald-50',
  }

  return (
    <aside className="fixed left-0 top-0 w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#185FA5] flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-xs leading-none truncate">MediChain</p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">Radiology System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-1.5 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-gray-400 px-3 py-3">No menu available</p>
        ) : items.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                active
                  ? 'bg-[#185FA5] text-white shadow-sm shadow-[#185FA5]/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div className="px-3 py-3 border-t border-gray-100">
        {userProfile ? (
          <div className="px-3 py-2.5 rounded-lg bg-gray-50 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-800 truncate">{userProfile.name || 'User'}</p>
              <span className={`badge text-[10px] flex-shrink-0 ${roleColor[role] || 'bg-gray-100 text-gray-500'}`}>
                {role}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate">{userProfile.department}</p>
            <p className="text-[10px] text-gray-300 font-mono truncate">
              {userProfile.address.slice(0, 10)}...{userProfile.address.slice(-6)}
            </p>
          </div>
        ) : (
          <div className="px-3 py-2.5 rounded-lg bg-gray-50">
            <p className="text-[10px] text-gray-400">Wallet not connected</p>
          </div>
        )}
      </div>
    </aside>
  )
}
