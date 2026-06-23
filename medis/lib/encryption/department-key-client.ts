/**
 * Helper client-side untuk mengambil departmentKey dari server.
 * Lihat app/api/encryption/department-key/route.ts untuk penjelasan kenapa
 * perhitungan kunci ini harus terjadi di server, bukan di browser.
 */
export async function fetchDepartmentKey(walletAddress: string): Promise<string> {
  const res = await fetch('/api/encryption/department-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengambil department key')
  }

  return data.departmentKey as string
}
