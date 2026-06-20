'use client'

export function DicomThumbnail({ src }: { src?: string }) {
  return (
    <div className="w-full aspect-square bg-[#0d0d1a] rounded-lg flex items-center justify-center">
      {src ? (
        <img src={src} alt="DICOM thumbnail" className="max-w-full max-h-full object-contain" />
      ) : (
        <p className="text-[#378ADD] text-xs font-mono">No preview available</p>
      )}
    </div>
  )
}
