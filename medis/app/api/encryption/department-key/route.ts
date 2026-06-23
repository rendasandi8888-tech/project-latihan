import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getUserProfile, getUserRole } from '@/lib/blockchain/contracts'

/**
 * POST /api/encryption/department-key
 *
 * Menghasilkan departmentKey yang dipakai untuk mengenkripsi/dekripsi Key Envelope
 * (lihat lib/encryption/key-envelope.ts).
 *
 * Kenapa lewat API route, bukan dihitung langsung di browser:
 *   departmentKey = sha256(department + ':' + DEPARTMENT_KEY_SECRET)
 *   DEPARTMENT_KEY_SECRET adalah env var SERVER-SIDE (tanpa prefix NEXT_PUBLIC_),
 *   jadi tidak pernah terkirim ke kode yang berjalan di browser. Kalau departmentKey
 *   dihitung di client, siapa pun yang tahu nama department (mis. "Radiology") bisa
 *   menebak/membongkar seluruh Key Envelope. Dengan secret di server, department
 *   saja tidak cukup untuk membongkar kunci.
 *
 * Body request: { walletAddress: string }
 *
 * Validasi yang dilakukan server (BUKAN percaya begitu saja apa yang dikirim browser):
 *   1. walletAddress harus terdaftar & aktif di UserRegistry (dicek on-chain di server)
 *   2. Department diambil dari data on-chain milik wallet itu sendiri — bukan dari
 *      department yang dikirim browser, supaya tidak bisa dipalsukan.
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress wajib diisi' }, { status: 400 })
    }

    const secret = process.env.DEPARTMENT_KEY_SECRET
    if (!secret) {
      // Sengaja gagal keras kalau secret belum di-set, daripada diam-diam pakai
      // fallback yang lemah/predictable.
      console.error('DEPARTMENT_KEY_SECRET belum di-set di .env.local')
      return NextResponse.json(
        { error: 'Server belum dikonfigurasi untuk enkripsi (DEPARTMENT_KEY_SECRET kosong)' },
        { status: 500 }
      )
    }

    // Verifikasi wallet terdaftar & aktif (role 0 = UNREGISTERED, lihat getUserRole)
    const role = await getUserRole(walletAddress)
    if (role === 0) {
      return NextResponse.json(
        { error: 'Wallet tidak terdaftar atau tidak aktif' },
        { status: 403 }
      )
    }

    const profile = await getUserProfile(walletAddress)
    if (!profile || !profile.isActive) {
      return NextResponse.json(
        { error: 'Wallet tidak terdaftar atau tidak aktif' },
        { status: 403 }
      )
    }

    if (!profile.department) {
      return NextResponse.json(
        { error: 'User ini belum memiliki department, hubungi admin' },
        { status: 400 }
      )
    }

    const departmentKey = createHash('sha256')
      .update(`${profile.department}:${secret}`)
      .digest('hex')

    return NextResponse.json({
      departmentKey,
      department: profile.department,
    })
  } catch (error: any) {
    console.error('Department Key Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
