'use client'

export function DicomUploader() {
  return (
    <div className="border-2 border-dashed border-[#185FA5]/30 rounded-xl p-12 text-center">
      <p className="text-gray-500 text-sm">Drop DICOM (.dcm) or image (.jpg, .png) files here</p>
      <p className="text-xs text-gray-400 mt-1">Full implementation in Sesi 5</p>
    </div>
  )
}
