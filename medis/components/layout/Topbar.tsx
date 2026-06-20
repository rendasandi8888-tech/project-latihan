'use client'

export function Topbar() {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <p className="text-sm text-gray-600">Good morning</p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </header>
  )
}
