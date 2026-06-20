'use client'

import { Shield } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#185FA5] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-xs leading-none">MediChain</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Radiology</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3">
        <p className="text-xs text-gray-400 px-3 py-2">Navigation placeholder</p>
      </nav>
    </aside>
  )
}
