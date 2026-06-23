'use client'

import { useState } from 'react'
import { useAuditTrail } from '@/hooks/useAuditTrail'

const ACTION_COLORS: Record<string, string> = {
  UPLOAD: 'bg-blue-100 text-blue-700',
  DOWNLOAD: 'bg-green-100 text-green-700',
  GRANT_ACCESS: 'bg-purple-100 text-purple-700',
  REVOKE_ACCESS: 'bg-red-100 text-red-700',
  VIEW: 'bg-amber-100 text-amber-700',
  LOGIN: 'bg-gray-100 text-gray-600',
}

export default function AuditTrailPage() {
  const { logs, isLoading, fetchLogs } = useAuditTrail()
  const [filter, setFilter] = useState('')
  const [loaded, setLoaded] = useState(false)

  const handleLoad = async () => {
    await fetchLogs()
    setLoaded(true)
  }

  const filtered = filter ? logs.filter(l => l.action === filter) : logs

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-500 text-sm mt-1">Riwayat semua aktivitas on-chain</p>
        </div>
        <button
          onClick={handleLoad}
          disabled={isLoading}
          className="bg-[#185FA5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#185FA5]/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Memuat...' : loaded ? 'Refresh' : 'Load Logs'}
        </button>
      </div>

      {loaded && (
        <div className="flex gap-2 flex-wrap">
          {['', 'UPLOAD', 'DOWNLOAD', 'GRANT_ACCESS', 'REVOKE_ACCESS', 'VIEW', 'LOGIN'].map(a => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === a ? 'bg-[#185FA5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {a || 'All'}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {!loaded ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-gray-400 text-sm">Klik "Load Logs" untuk memuat audit trail dari blockchain</p>
            <p className="text-gray-300 text-xs">Proses ini memerlukan beberapa detik</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-[#185FA5]/30 border-t-[#185FA5] rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Memuat dari blockchain...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">Tidak ada log yang ditemukan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Record</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Details</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {log.performedBy.slice(0,6)}...{log.performedBy.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.targetRecordId > 0 ? `#${log.targetRecordId}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.details || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(log.timestamp * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
