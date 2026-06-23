'use client'

import { useState, useEffect, useRef } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { getUserRole, getUserProfile } from '@/lib/blockchain/contracts'
import type { UserRole, UserProfile } from '@/types'

interface RoleState {
  role: UserRole
  userProfile: UserProfile | null
  isLoading: boolean
  isConnected: boolean
  address: string | null
}

const ROLE_MAP: UserRole[] = ['UNREGISTERED', 'ADMIN', 'DOCTOR', 'STAFF', 'PATIENT']

// Cache sederhana di memory — bertahan selama browser tab tidak di-refresh
const roleCache = new Map<string, { role: UserRole; userProfile: UserProfile | null; fetchedAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 menit

export function useRole(): RoleState {
  const account = useActiveAccount()
  const [state, setState] = useState<RoleState>({
    role: 'UNREGISTERED',
    userProfile: null,
    isLoading: true,
    isConnected: false,
    address: null,
  })
  const fetchingRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function fetchRole() {
      if (!account?.address) {
        if (!cancelled) {
          setState({ role: 'UNREGISTERED', userProfile: null, isLoading: false, isConnected: false, address: null })
        }
        return
      }

      // Cek cache dulu
      const cached = roleCache.get(account.address)
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        if (!cancelled) {
          setState({ role: cached.role, userProfile: cached.userProfile, isLoading: false, isConnected: true, address: account.address })
        }
        return
      }

      // Hindari double fetch
      if (fetchingRef.current) return
      fetchingRef.current = true

      setState(prev => ({ ...prev, isLoading: true, isConnected: true, address: account.address }))

      try {
        const roleNumber = await getUserRole(account.address)
        const roleName = ROLE_MAP[roleNumber] ?? 'UNREGISTERED'

        let profile: UserProfile | null = null
        if (roleNumber !== 0) {
          const data = await getUserProfile(account.address)
          if (data) {
            profile = {
              address: data.address,
              role: roleName,
              name: data.name,
              department: data.department,
              registeredAt: data.registeredAt,
              isActive: data.isActive,
            }
          }
        }

        // Simpan ke cache
        roleCache.set(account.address, { role: roleName, userProfile: profile, fetchedAt: Date.now() })

        if (!cancelled) {
          setState({ role: roleName, userProfile: profile, isLoading: false, isConnected: true, address: account.address })
        }
      } catch (error) {
        console.error('useRole: failed to fetch role', error)
        if (!cancelled) {
          setState({ role: 'UNREGISTERED', userProfile: null, isLoading: false, isConnected: true, address: account.address })
        }
      } finally {
        fetchingRef.current = false
      }
    }

    fetchRole()
    return () => { cancelled = true }
  }, [account?.address])

  return state
}
