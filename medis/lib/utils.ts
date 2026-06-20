import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'

// ─── Tailwind class merge utility ────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Address utilities ────────────────────────────────────────────────────────
/**
 * Shorten a wallet address: 0x1234...abcd
 */
export function shortAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`
}

/**
 * Mask a patient ID: ••••1234
 */
export function maskPatientId(id: string): string {
  if (!id || id.length <= 4) return '••••'
  return `••••${id.slice(-4)}`
}

/**
 * Mask a patient name: J*** D***
 */
export function maskPatientName(name: string): string {
  if (!name) return '***'
  return name
    .split(' ')
    .map((word) => (word.length > 0 ? `${word[0]}${'*'.repeat(word.length - 1)}` : ''))
    .join(' ')
}

// ─── Date utilities ───────────────────────────────────────────────────────────
/**
 * Format Unix timestamp to readable date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format Unix timestamp to date only
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// ─── Blockchain utilities ─────────────────────────────────────────────────────
/**
 * Shorten a tx hash for display: 0x1234...abcd
 */
export function shortTxHash(hash: string): string {
  if (!hash) return ''
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

/**
 * Get Monad Explorer URL for a transaction
 */
export function getExplorerTxUrl(txHash: string): string {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.monadexplorer.com'
  return `${explorerUrl}/tx/${txHash}`
}

/**
 * Get Monad Explorer URL for an address
 */
export function getExplorerAddressUrl(address: string): string {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.monadexplorer.com'
  return `${explorerUrl}/address/${address}`
}

// ─── Toast notification helpers ───────────────────────────────────────────────
export function toastSuccess(message: string, txHash?: string) {
  if (txHash) {
    const explorerUrl = getExplorerTxUrl(txHash)
    toast.success(message, {
      description: (
        `Tx: ${shortTxHash(txHash)}`
      ),
      action: {
        label: 'View on Explorer',
        onClick: () => window.open(explorerUrl, '_blank'),
      },
      duration: 6000,
    })
  } else {
    toast.success(message)
  }
}

export function toastError(message: string, error?: Error) {
  toast.error(message, {
    description: error?.message,
    duration: 8000,
  })
}

export function toastLoading(message: string) {
  return toast.loading(message)
}

export function toastBlockchain(message: string, txHash: string) {
  const explorerUrl = getExplorerTxUrl(txHash)
  toast.success(message, {
    description: `Transaction confirmed · ${shortTxHash(txHash)}`,
    action: {
      label: '🔗 View on Monad Explorer',
      onClick: () => window.open(explorerUrl, '_blank'),
    },
    duration: 8000,
  })
}

// ─── Validation utilities ─────────────────────────────────────────────────────
/**
 * Check if a string is a valid Ethereum address
 */
export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if a string is a valid IPFS CID
 */
export function isValidCID(cid: string): boolean {
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{56,})$/.test(cid)
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert ArrayBuffer to hex string
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
