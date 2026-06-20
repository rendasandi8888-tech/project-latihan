/**
 * @file aes-gcm.ts
 * @description AES-256-GCM file encryption menggunakan Web Crypto API browser.
 *
 * AES-256-GCM (Galois/Counter Mode) dipilih karena:
 * - Authenticated encryption: proteksi terhadap tampering (integritas + kerahasiaan)
 * - 256-bit key: keamanan maksimal
 * - IV 12 byte: optimal untuk GCM mode
 * - Auth tag 128-bit: 16 byte authentication tag otomatis di-append
 *
 * Key di-generate dari NJCS keystream untuk menggabungkan
 * ketidakterdugaan chaos theory dengan kekuatan kriptografi AES.
 */

import { generateAESKeyFromNJCS, type NJCSParams } from './njcs'
import { uint8ArrayToBase64, bufferToHex } from '@/lib/utils'

// ─── Fungsi 1: Enkripsi file dengan AES-256-GCM ───────────────────────────────

/**
 * Enkripsi ArrayBuffer (file DICOM) menggunakan AES-256-GCM.
 * Key di-derive dari NJCS keystream, IV di-generate secara random.
 *
 * Web Crypto API otomatis meng-append 16-byte GCM auth tag
 * di akhir ciphertext sehingga encryptedBuffer.byteLength = fileBuffer.byteLength + 16.
 *
 * @param fileBuffer ArrayBuffer file yang akan dienkripsi
 * @param njcsParams Parameter NJCS untuk derive AES key
 * @returns Object berisi encryptedBuffer, iv (12 byte), dan authTag (16 byte)
 */
export async function encryptFile(
  fileBuffer: ArrayBuffer,
  njcsParams: NJCSParams
): Promise<{
  encryptedBuffer: ArrayBuffer
  iv: Uint8Array
  authTag: Uint8Array
}> {
  // ── Step 1: Derive AES key dari NJCS keystream ──
  const rawKey = generateAESKeyFromNJCS(njcsParams)

  // ── Step 2: Import raw key ke Web Crypto API ──
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,           // tidak bisa di-export lagi
    ['encrypt']      // hanya untuk enkripsi
  )

  // ── Step 3: Generate IV 12 byte secara random ──
  // GCM mode: IV harus unik per enkripsi, 12 byte adalah ukuran optimal
  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)

  // ── Step 4: Enkripsi dengan AES-256-GCM ──
  // Web Crypto API meng-append auth tag 128-bit (16 byte) di akhir ciphertext
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,  // 128-bit = 16 byte auth tag
    },
    cryptoKey,
    fileBuffer
  )

  // ── Step 5: Ekstrak auth tag (16 byte terakhir dari encryptedBuffer) ──
  const encryptedBytes = new Uint8Array(encryptedBuffer)
  const authTag = encryptedBytes.slice(encryptedBytes.length - 16)

  return {
    encryptedBuffer,
    iv,
    authTag,
  }
}

// ─── Fungsi 2: Dekripsi file dengan AES-256-GCM ──────────────────────────────

/**
 * Dekripsi ArrayBuffer (file DICOM terenkripsi) menggunakan AES-256-GCM.
 * Auth tag diverifikasi otomatis — jika file dimodifikasi, dekripsi akan gagal.
 *
 * @param encryptedBuffer ArrayBuffer file terenkripsi (sudah include auth tag)
 * @param njcsParams Parameter NJCS yang sama saat enkripsi
 * @param iv Initialization vector 12 byte yang digunakan saat enkripsi
 * @returns ArrayBuffer file original yang sudah didekripsi
 * @throws Error jika auth tag tidak valid (file tampering terdeteksi)
 */
export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  njcsParams: NJCSParams,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  // ── Step 1: Derive AES key yang sama dari NJCS ──
  const rawKey = generateAESKeyFromNJCS(njcsParams)

  // ── Step 2: Import raw key ke Web Crypto API ──
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']    // hanya untuk dekripsi
  )

  // ── Step 3: Dekripsi dengan AES-256-GCM ──
  // Web Crypto API otomatis verifikasi auth tag.
  // Jika tag tidak cocok (file dimodifikasi), akan throw DOMException: OperationError
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
      tagLength: 128,
    },
    cryptoKey,
    encryptedBuffer
  )

  return decryptedBuffer
}

// ─── Fungsi 3: Hitung SHA-256 hash file ──────────────────────────────────────

/**
 * Hitung SHA-256 hash dari ArrayBuffer file.
 * Hash ini disimpan di blockchain untuk verifikasi integritas file.
 *
 * @param fileBuffer ArrayBuffer file yang akan di-hash
 * @returns Hex string SHA-256 hash (64 karakter)
 */
export async function computeFileHash(fileBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
  return bufferToHex(hashBuffer)
}

// ─── Fungsi 4: Verifikasi integritas file ────────────────────────────────────

/**
 * Verifikasi integritas file dengan membandingkan hash SHA-256.
 * Digunakan setelah dekripsi untuk memastikan file tidak korup atau dimodifikasi.
 *
 * @param fileBuffer ArrayBuffer file yang akan diverifikasi
 * @param expectedHash Hex string hash yang tersimpan di blockchain
 * @returns true jika hash cocok, false jika file telah dimodifikasi
 */
export async function verifyFileIntegrity(
  fileBuffer: ArrayBuffer,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await computeFileHash(fileBuffer)
  // Perbandingan case-insensitive karena hex bisa uppercase atau lowercase
  return actualHash.toLowerCase() === expectedHash.toLowerCase()
}

// ─── Helper: Import key dari raw bytes (untuk testing) ───────────────────────

/**
 * Derive dan export AES key dari NJCS params sebagai base64 string.
 * Hanya untuk debugging/testing — jangan gunakan di production.
 *
 * @param njcsParams Parameter NJCS
 * @returns Base64 string representasi raw AES key
 */
export function deriveAESKeyBytes(njcsParams: NJCSParams): string {
  const rawKey = generateAESKeyFromNJCS(njcsParams)
  return uint8ArrayToBase64(rawKey)
}

/*
 * ─── Unit Test ─────────────────────────────────────────────────────────────────
 *
 * import { encryptFile, decryptFile, computeFileHash, verifyFileIntegrity } from './aes-gcm'
 * import { generateRandomNJCSParams } from './njcs'
 *
 * // Test 1: Enkripsi dan dekripsi harus menghasilkan file asli
 * const params = generateRandomNJCSParams()
 * const testData = new TextEncoder().encode("Hello MediChain DICOM test data").buffer
 *
 * const { encryptedBuffer, iv } = await encryptFile(testData, params)
 * const decryptedBuffer = await decryptFile(encryptedBuffer, params, iv)
 * const decryptedText = new TextDecoder().decode(decryptedBuffer)
 * console.assert(decryptedText === "Hello MediChain DICOM test data", "Test 1 FAILED")
 * console.log("Test 1 PASSED: AES-GCM encrypt/decrypt roundtrip OK")
 *
 * // Test 2: Hash verification
 * const hash = await computeFileHash(testData)
 * const isValid = await verifyFileIntegrity(testData, hash)
 * console.assert(isValid === true, "Test 2 FAILED: hash verification failed")
 * console.log("Test 2 PASSED: SHA-256 hash verification OK")
 *
 * // Test 3: Modified file should fail hash check
 * const modifiedData = new TextEncoder().encode("Modified data").buffer
 * const isModifiedValid = await verifyFileIntegrity(modifiedData, hash)
 * console.assert(isModifiedValid === false, "Test 3 FAILED: modified file passed hash check")
 * console.log("Test 3 PASSED: modified file correctly detected")
 *
 * // Test 4: Wrong params should fail decryption
 * const wrongParams = generateRandomNJCSParams()
 * try {
 *   await decryptFile(encryptedBuffer, wrongParams, iv)
 *   console.log("Test 4 FAILED: wrong params did not throw")
 * } catch (e) {
 *   console.log("Test 4 PASSED: wrong params correctly throw on decrypt")
 * }
 */
