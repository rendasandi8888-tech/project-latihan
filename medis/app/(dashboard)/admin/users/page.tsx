'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { getAllUsers, registerUser, revokeUser } from '@/lib/blockchain/contracts'
import { toastLoading, toastBlockchain, toastError } from '@/lib/utils'
import { DEPARTMENTS, ROLE_LABELS, ROLE_COLORS } from '@/constants'
import { UserPlus, RefreshCw } from 'lucide-react'

const ROLE_OPTIONS = [{ v: 2, l: 'Doctor' }, { v: 3, l: 'Staff' }, { v: 4, l: 'Patient' }]
const ROLE_NUM_LABEL: Record<number, string> = { 1: 'ADMIN', 2: 'DOCTOR', 3: 'STAFF', 4: 'PATIENT', 0: 'UNREGISTERED' }

export default function AdminUsersPage() {
  const account = useActiveAccount()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ address: '', name: '', department: DEPARTMENTS[0], role: 2 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try { setUsers(await getAllUsers()) }
    catch (e) { toastError('Failed to load users', e as Error) }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRegister = async () => {
    if (!account) return
    if (!form.address || !form.name || !form.department) return toastError('All fields required', new Error(''))
    setIsSubmitting(true)
    try {
      toastLoading('Registering user on-chain...')
      const tx = await registerUser({ userAddress: form.address, role: form.role, name: form.name, department: form.department }, account)
      toastBlockchain('User registered', tx)
      setForm({ address: '', name: '', department: DEPARTMENTS[0], role: 2 })
      setShowForm(false)
      await load()
    } catch (e) { toastError('Failed to register', e as Error) }
    finally { setIsSubmitting(false) }
  }

  const handleRevoke = async (addr: string) => {
    if (!account || !confirm('Revoke this user?')) return
    try {
      toastLoading('Revoking user...')
      const tx = await revokeUser(addr, account)
      toastBlockchain('User revoked', tx)
      await load()
    } catch (e) { toastError('Failed to revoke', e as Error) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">All registered accounts on UserRegistry contract</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="mc-btn-secondary" disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="mc-btn-primary">
            <UserPlus className="w-3.5 h-3.5" />
            {showForm ? 'Cancel' : 'Register User'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mc-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Register New User</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-400 font-medium">Wallet Address</label>
              <input className="mc-input" placeholder="0x..." value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Full Name</label>
              <input className="mc-input" placeholder="Dr. Budi Santoso" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Department</label>
              <select className="mc-input" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Role</label>
              <select className="mc-input" value={form.role} onChange={e => setForm(f => ({...f, role: Number(e.target.value)}))}>
                {ROLE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleRegister} disabled={isSubmitting} className="mc-btn-primary w-full py-2.5">
            {isSubmitting ? 'Registering...' : 'Register on Blockchain'}
          </button>
        </div>
      )}

      <div className="mc-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-400">No users registered yet</p>
          </div>
        ) : (
          <table className="mc-table">
            <thead><tr>
              <th className="mc-th">Name</th>
              <th className="mc-th">Wallet</th>
              <th className="mc-th">Role</th>
              <th className="mc-th">Department</th>
              <th className="mc-th">Status</th>
              <th className="mc-th" />
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.address} className="mc-tr">
                  <td className="mc-td font-medium text-gray-900">{u.name || '—'}</td>
                  <td className="mc-td font-mono text-xs text-gray-400">{u.address.slice(0,8)}...{u.address.slice(-6)}</td>
                  <td className="mc-td">
                    <span className={`badge ${ROLE_COLORS[ROLE_NUM_LABEL[u.role]] || 'bg-gray-100 text-gray-500'}`}>
                      {ROLE_LABELS[ROLE_NUM_LABEL[u.role]] || 'Unknown'}
                    </span>
                  </td>
                  <td className="mc-td text-gray-500">{u.department || '—'}</td>
                  <td className="mc-td">
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="mc-td text-right">
                    {u.isActive && (
                      <button onClick={() => handleRevoke(u.address)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
