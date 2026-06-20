'use client'

import React, { useState, useEffect } from 'react'
import { Upload, Download, UserCheck, UserX, LogIn, Eye, Search, Filter, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'

// Dummy data for visual layout
const dummyLogs = [
  { id: 1, type: 'Upload', desc: 'Uploaded CT Scan (Head)', performer: '0x123...4567', timestamp: '19 Jun 2026, 09:14', txHash: '0x8f2d...3a1c' },
  { id: 2, type: 'Grant', desc: 'Granted access to Oncology Dept', performer: '0xAdmin...8888', timestamp: '19 Jun 2026, 10:20', txHash: '0x1b4a...9f2b' },
  { id: 3, type: 'View', desc: 'Viewed Medical Record', performer: '0xDoc...3333', timestamp: '19 Jun 2026, 11:05', txHash: '0x5c7e...1d4a' },
  { id: 4, type: 'Download', desc: 'Downloaded DICOM File', performer: '0xDoc...3333', timestamp: '19 Jun 2026, 11:10', txHash: '0x9a8b...7c6d' },
  { id: 5, type: 'Revoke', desc: 'Revoked access from Emergency Dept', performer: '0xAdmin...8888', timestamp: '18 Jun 2026, 15:30', txHash: '0x2d3f...4e5g' },
  { id: 6, type: 'Login', desc: 'System Login', performer: '0xStaff...1111', timestamp: '18 Jun 2026, 08:00', txHash: '0x0a1b...2c3d' },
]

export default function AuditTrailPage() {
  const account = useActiveAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState(dummyLogs)
  const [filterAction, setFilterAction] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Mock fetching logs
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'All' || log.type === filterAction
    const matchesSearch = log.performer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAction && matchesSearch
  })

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'Upload': return { icon: Upload, bg: 'bg-[#1D9E75]/10', text: 'text-[#1D9E75]' }
      case 'Download': return { icon: Download, bg: 'bg-[#185FA5]/10', text: 'text-[#185FA5]' }
      case 'Grant': return { icon: UserCheck, bg: 'bg-teal-100', text: 'text-teal-700' }
      case 'Revoke': return { icon: UserX, bg: 'bg-[#A32D2D]/10', text: 'text-[#A32D2D]' }
      case 'Login': return { icon: LogIn, bg: 'bg-purple-100', text: 'text-purple-700' }
      case 'View': return { icon: Eye, bg: 'bg-[#BA7517]/10', text: 'text-[#BA7517]' }
      default: return { icon: Activity, bg: 'bg-gray-100', text: 'text-gray-700' }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-sm text-gray-500 mt-1">Immutable activity log on Monad Testnet</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by wallet address or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5]"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20 focus:border-[#185FA5] bg-white appearance-none"
          >
            <option value="All">All Actions</option>
            <option value="Upload">Upload</option>
            <option value="Download">Download</option>
            <option value="Grant">Grant Access</option>
            <option value="Revoke">Revoke Access</option>
            <option value="Login">Login</option>
            <option value="View">View</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <CalendarIcon className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#185FA5] mb-4" />
            <p className="text-gray-500">Loading audit trail from Monad Testnet...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No logs found matching your criteria.</p>
          </div>
        ) : (
          <div className="relative pl-4 sm:pl-8 border-l-2 border-gray-100 space-y-8">
            {filteredLogs.map((log) => {
              const style = getLogStyle(log.type)
              const Icon = style.icon
              return (
                <div key={log.id} className="relative">
                  {/* Icon Node */}
                  <div className={`absolute -left-[35px] sm:-left-[51px] top-1 w-10 h-10 rounded-full ${style.bg} ${style.text} flex items-center justify-center ring-4 ring-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{log.desc}</h4>
                      <span className="text-xs text-gray-500 font-medium bg-white px-2.5 py-1 rounded-full border border-gray-200">
                        {log.timestamp}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm mt-3 pt-3 border-t border-gray-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">By:</span>
                        <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{log.performer}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Tx:</span>
                        <a 
                          href={`https://testnet.monadexplorer.com/tx/${log.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-mono text-[#185FA5] hover:underline bg-[#185FA5]/5 px-1.5 py-0.5 rounded"
                        >
                          {log.txHash}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {!isLoading && filteredLogs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Entries
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Activity(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
}
