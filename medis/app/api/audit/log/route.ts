import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const LOG_DIR = join(process.cwd(), 'data')
const LOG_FILE = join(LOG_DIR, 'audit-log.json')

function readLogs() {
  if (!existsSync(LOG_FILE)) return []
  try { return JSON.parse(readFileSync(LOG_FILE, 'utf-8')) } catch { return [] }
}

function writeLogs(logs: any[]) {
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
  writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, performedBy, targetRecordId, targetUser, department, details } = body

    if (!action || !performedBy) {
      return NextResponse.json({ error: 'action and performedBy required' }, { status: 400 })
    }

    const logs = readLogs()
    const newEntry = {
      id: logs.length + 1,
      action,
      performedBy,
      targetRecordId: targetRecordId || 0,
      targetUser: targetUser || '0x0000000000000000000000000000000000000000',
      timestamp: Math.floor(Date.now() / 1000),
      department: department || 'Unknown',
      details: details || '',
      source: 'server',
    }

    logs.push(newEntry)
    writeLogs(logs)

    return NextResponse.json({ success: true, entry: newEntry })
  } catch (error: any) {
    console.error('Audit log write error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
