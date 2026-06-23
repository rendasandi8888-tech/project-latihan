'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { grantAccess, grantDepartmentAccess, revokeRecordAccess, hasRecordAccess } from '@/lib/blockchain/contracts'
import { toastLoading, toastBlockchain, toastError } from '@/lib/utils'
import { DEPARTMENTS } from '@/constants'
import { CheckCircle, XCircle } from 'lucide-react'

type Tab = 'grant-user' | 'grant-dept' | 'revoke'

export default function AccessControlPage() {
  const account = useActiveAccount()
  const [tab, setTab] = useState<Tab>('grant-user')
  const [recordId, setRecordId] = useState('')
  const [target, setTarget] = useState('')
  const [dept, setDept] = useState(DEPARTMENTS[0])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{tx: string; msg: string} | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [checkId, setCheckId] = useState('')
  const [checkAddr, setCheckAddr] = useState('')
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  const reset = () => { setResult(null); setErr(null) }

  const submit = async () => {
    if (!account) return
    if (!recordId) { setErr('Record ID required'); return }
    if ((tab !== 'grant-dept') && !target) { setErr('Wallet address required'); return }
    setBusy(true); reset()
    try {
      let tx = ''
      let msg = ''
      if (tab === 'grant-user') {
        toastLoading('Granting access...')
        tx = await grantAccess(Number(recordId), target, account)
        msg = `Access to Record #${recordId} granted to ${target.slice(0,8)}...`
      } else if (tab === 'grant-dept') {
        toastLoading(`Granting ${dept} access...`)
        tx = await grantDepartmentAccess(Number(recordId), dept, account)
        msg = `All ${dept} doctors now have access to Record #${recordId}`
      } else {
        if (!confirm(`Revoke access of ${target.slice(0,8)}... from Record #${recordId}?`)) { setBusy(false); return }
        toastLoading('Revoking access...')
        tx = await revokeRecordAccess(Number(recordId), target, account)
        msg = `Access revoked from Record #${recordId}`
      }
      toastBlockchain(msg, tx)
      setResult({ tx, msg })
    } catch (e: any) {
      setErr(e.message || 'Transaction failed')
      toastError('Transaction failed', e)
    } finally { setBusy(false) }
  }

  const checkAccess = async () => {
    if (!checkId || !checkAddr) return
    setChecking(true); setCheckResult(null)
    try { setCheckResult(await hasRecordAccess(Number(checkId), checkAddr)) }
    catch (e: any) { toastError('Check failed', e) }
    finally { setChecking(false) }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'grant-user', label: 'Grant to User' },
    { key: 'grant-dept', label: 'Grant to Department' },
    { key: 'revoke', label: 'Revoke' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="page-title">Access Control</h1>
        <p className="page-subtitle">Manage who can decrypt and view specific records</p>
      </div>

      <div className="mc-card p-5 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1.5 bg-gray-50 rounded-lg p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); reset() }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium">Record ID</label>
            <input className="mc-input" type="number" placeholder="e.g. 1" value={recordId} onChange={e => setRecordId(e.target.value)} />
          </div>

          {tab === 'grant-dept' ? (
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Department</label>
              <select className="mc-input" value={dept} onChange={e => setDept(e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">
                {tab === 'revoke' ? 'Wallet to revoke' : 'Doctor wallet address'}
              </label>
              <input className="mc-input" placeholder="0x..." value={target} onChange={e => setTarget(e.target.value)} />
            </div>
          )}

          {err && <p className="text-xs text-red-500">{err}</p>}

          {result && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 space-y-1.5">
              <p className="text-xs text-emerald-700 font-medium">{result.msg}</p>
              <a href={`https://testnet.monadexplorer.com/tx/${result.tx}`} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[11px] text-[#185FA5] hover:underline break-all block">
                {result.tx}
              </a>
            </div>
          )}

          <button onClick={submit} disabled={busy || !account}
            className={`w-full py-2.5 ${tab === 'revoke' ? 'mc-btn-danger' : 'mc-btn-primary'}`}
          >
            {busy ? 'Processing...' : tab === 'grant-user' ? 'Grant Access' : tab === 'grant-dept' ? 'Grant Department Access' : 'Revoke Access'}
          </button>
        </div>
      </div>

      {/* Check access */}
      <div className="mc-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Check Access</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className="mc-input" type="number" placeholder="Record ID" value={checkId} onChange={e => setCheckId(e.target.value)} />
          <input className="mc-input" placeholder="Wallet address" value={checkAddr} onChange={e => setCheckAddr(e.target.value)} />
        </div>
        <button onClick={checkAccess} disabled={checking || !checkId || !checkAddr} className="mc-btn-secondary w-full py-2">
          {checking ? 'Checking...' : 'Check Access'}
        </button>
        {checkResult !== null && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
            checkResult ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {checkResult
              ? <><CheckCircle className="w-4 h-4" /> Has access to Record #{checkId}</>
              : <><XCircle className="w-4 h-4" /> No access to Record #{checkId}</>
            }
          </div>
        )}
      </div>
    </div>
  )
}
