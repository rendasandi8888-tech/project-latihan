'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react'
import { useRole } from '@/hooks/useRole'
import { LayoutDashboard, Users, History, UserCircle, Upload, ShieldCheck, LogOut, Shield } from 'lucide-react'

type MenuItem = { href: string; label: string; icon: typeof LayoutDashboard }

const MENU_ITEMS: Record<string, MenuItem[]> = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/access', label: 'Access Management', icon: ShieldCheck },
    { href: '/audit-trail', label: 'Audit Trail', icon: History },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ],
  DOCTOR: [
    { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/records', label: 'My Patients', icon: Users },
    { href: '/audit-trail', label: 'Audit Trail', icon: History },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ],
  STAFF: [
    { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/upload', label: 'Upload Record', icon: Upload },
    { href: '/audit-trail', label: 'Audit Trail', icon: History },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ],
  PATIENT: [
    { href: '/patient', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ],
}

function maskAddress(address?: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, isLoading } = useRole()
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()
  const menuItems = MENU_ITEMS[role] ?? []

  const handleDisconnect = () => {
    if (wallet) disconnect(wallet)
    router.push('/')
  }

  return (
    <aside className="w-[220px] h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col z-20">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-[#185FA5] flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-none truncate">MediChain</p>
          <p className="text-[11px] text-gray-400 leading-none mt-1 truncate">Radiology</p>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-3" />

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 px-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-8 bg-gray-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <p className="text-xs text-gray-400 px-3 py-2">No menu available</p>
        ) : (
          menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && item.href !== '/doctor' && item.href !== '/staff' && item.href !== '/patient' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-[#E6F1FB] text-[#185FA5] font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })
        )}
      </nav>

      <div className="h-px bg-gray-100 mx-3" />

      <div className="px-3 py-3 space-y-1.5">
        {account?.address && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] shrink-0" />
            <span className="text-xs font-mono text-gray-600 truncate">{maskAddress(account.address)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#185FA5] shrink-0" />
          <span className="text-[11px] text-gray-400">Monad Testnet</span>
        </div>
        <button onClick={handleDisconnect}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#A32D2D] hover:bg-red-50 transition-colors">
          <LogOut className="w-[18px] h-[18px]" />
          Disconnect
        </button>
      </div>
    </aside>
  )
}
