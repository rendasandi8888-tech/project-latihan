'use client'

import { ConnectButton } from 'thirdweb/react'
import { client, monadTestnet } from '@/lib/blockchain/client'
import { useRole } from '@/hooks/useRole'
import { Bell } from 'lucide-react'

export function Topbar() {
  const { userProfile } = useRole()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <p className="text-sm font-medium text-gray-700">
          {userProfile?.name ? `${greeting}, ${userProfile.name}` : greeting}
        </p>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ConnectButton client={client} chain={monadTestnet} />
      </div>
    </header>
  )
}
