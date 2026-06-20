'use client'

import type { MedicalRecord } from '@/types'

export function RecordCard({ record }: { record: MedicalRecord }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-900">{record.modality} — {record.bodyPart}</p>
      <p className="text-xs text-gray-400 mt-1">{record.department}</p>
    </div>
  )
}
