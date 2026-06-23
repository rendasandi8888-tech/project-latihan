import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const LOG_FILE = join(process.cwd(), 'data', 'audit-log.json')

export async function GET(request: NextRequest) {
  try {
    if (!existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [], total: 0 })
    }
    const logs = JSON.parse(readFileSync(LOG_FILE, 'utf-8'))
    const sorted = [...logs].reverse()
    return NextResponse.json({ logs: sorted, total: logs.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
