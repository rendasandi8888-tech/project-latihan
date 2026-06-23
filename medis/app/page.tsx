'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton } from 'thirdweb/react'
import { client, monadTestnet } from '@/lib/blockchain/client'
import { useRole } from '@/hooks/useRole'
import { Activity, Shield, Database, Lock } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { role, isLoading, isConnected } = useRole()

  useEffect(() => {
    if (!isConnected || isLoading) return
    const map: Record<string, string> = {
      ADMIN: '/admin', DOCTOR: '/doctor', STAFF: '/staff'
    }
    if (map[role]) router.push(map[role])
  }, [role, isLoading, isConnected, router])

  const features = [
    { icon: Lock, title: 'NJCS Encryption', desc: 'Hyperchaotic 4D keystream — AES-256-GCM envelope' },
    { icon: Database, title: 'IPFS Storage', desc: 'Decentralized, content-addressed file storage' },
    { icon: Shield, title: 'On-chain Audit', desc: 'Every action recorded immutably on Monad Testnet' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#F8F9FB] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#185FA5] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-none">MediChain</p>
            <p className="text-[10px] text-gray-400">Radiology System</p>
          </div>
        </div>
        <a href="/verify" className="text-xs text-[#185FA5] hover:underline font-medium">
          Verify Record →
        </a>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#185FA5]/8 text-[#185FA5] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
          Live on Monad Testnet
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 max-w-lg leading-tight">
          Blockchain-secured<br />medical imaging records
        </h1>
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-10">
          DICOM files encrypted with a hyperchaotic cipher, stored on IPFS,
          and access-controlled on-chain — built for radiology workflows.
        </p>

        {/* Connect card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7 w-full max-w-sm space-y-4">
          <p className="text-sm font-semibold text-gray-800">Connect wallet to continue</p>
          <div className="flex justify-center">
            <ConnectButton client={client} chain={monadTestnet} />
          </div>
          {isConnected && isLoading && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="spinner w-3 h-3" />
              Checking role on-chain...
            </div>
          )}
          {isConnected && !isLoading && role === 'UNREGISTERED' && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-xs text-amber-700 text-left">
              <strong>Not registered.</strong> Contact your administrator to get access.
            </div>
          )}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl w-full">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-4 text-left shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#185FA5]/8 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#185FA5]" />
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-1">{f.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <footer className="text-center py-5 text-[10px] text-gray-300">
        MediChain Radiology · Monad Testnet · {new Date().getFullYear()}
      </footer>
    </main>
  )
}
