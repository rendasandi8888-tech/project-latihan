'use client'

import { useState } from 'react'
import { Download, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEncryption } from '@/hooks/useEncryption'
import { toastSuccess, toastError } from '@/lib/utils'

interface DecryptDownloadButtonProps {
  dicomCID: string
  keyEnvelopeCID: string
  department: string
  recordId: string
  filename?: string
}

/**
 * DecryptDownloadButton — tombol untuk mendekripsi dan download file DICOM.
 * Seluruh proses dekripsi terjadi di browser (client-side).
 * File tidak pernah dikirim dalam bentuk terenkripsi ke server.
 */
export function DecryptDownloadButton({
  dicomCID,
  keyEnvelopeCID,
  department,
  filename = 'record.dcm',
}: DecryptDownloadButtonProps) {
  const { isProcessing: isDecrypting, decryptAndDownload } = useEncryption()
  const [isDone, setIsDone] = useState(false)

  const handleDecrypt = async () => {
    try {
      await decryptAndDownload(dicomCID, keyEnvelopeCID, department, filename)
      setIsDone(true)
      toastSuccess('File decrypted and downloaded successfully')
      setTimeout(() => setIsDone(false), 3000)
    } catch (err) {
      toastError('Decryption failed', err as Error)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDecrypt}
        disabled={isDecrypting}
        className="w-full bg-[#185FA5] hover:bg-[#164f8a] text-white"
      >
        {isDecrypting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Decrypting...
          </>
        ) : isDone ? (
          <>
            <ShieldCheck className="w-4 h-4" />
            Downloaded
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Decrypt &amp; Download .dcm
          </>
        )}
      </Button>
      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        File decrypted locally · never leaves your device unencrypted
      </p>
    </div>
  )
}
