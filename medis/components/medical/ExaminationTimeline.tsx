'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Activity, Bone } from 'lucide-react'

export interface ExaminationEntry {
  id: string
  date: string
  modality: 'CT' | 'XRAY' | string
  bodyPart: string
  department: string
}

interface ExaminationTimelineProps {
  entries: ExaminationEntry[]
  onRecordClick?: (id: string) => void
}

export function ExaminationTimeline({ entries, onRecordClick }: ExaminationTimelineProps) {
  const router = useRouter()

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
        <Calendar className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No examination records found.</p>
      </div>
    )
  }

  // Sort entries by date descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleClick = (id: string) => {
    if (onRecordClick) {
      onRecordClick(id)
    } else {
      router.push(`/records/${id}`)
    }
  }

  return (
    <div className="relative border-l border-gray-200 ml-4 space-y-6 pb-4">
      {sortedEntries.map((entry, index) => {
        const isCT = entry.modality.toUpperCase().includes('CT')
        const colorClass = isCT ? 'bg-[#185FA5] ring-[#185FA5]/30' : 'bg-[#1D9E75] ring-[#1D9E75]/30'
        const Icon = isCT ? Activity : Bone

        return (
          <div key={entry.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div 
              className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ${colorClass}`}
            />
            
            {/* Entry Card */}
            <div 
              onClick={() => handleClick(entry.id)}
              className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${isCT ? 'bg-[#185FA5]/10 text-[#185FA5]' : 'bg-[#1D9E75]/10 text-[#1D9E75]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#185FA5] transition-colors">
                      {entry.modality} Scan
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">ID: {entry.id.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-50">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Body Part</p>
                  <p className="text-sm text-gray-700">{entry.bodyPart}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Department</p>
                  <p className="text-sm text-gray-700">{entry.department}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
