'use client'

import { useState, useEffect } from 'react'
import type { UserRole, UserProfile } from '@/types'

interface RoleState {
  role: UserRole
  userProfile: UserProfile | null
  isLoading: boolean
  isConnected: boolean
  address: string | null
}

/**
 * useRole — query role dari smart contract UserRegistry berdasarkan wallet yang connect.
 * Implementasi lengkap di Sesi 4 setelah Thirdweb client setup.
 * Saat ini return placeholder untuk allow Sesi 3 build tanpa error.
 */
export function useRole(): RoleState {
  const [state, setState] = useState<RoleState>({
    role: 'UNREGISTERED',
    userProfile: null,
    isLoading: false,
    isConnected: false,
    address: null,
  })

  // Implementasi penuh di Sesi 4:
  // - useActiveAccount() dari thirdweb/react
  // - readContract(userRegistryContract, 'getUser', [address])
  // - Map Role enum dari contract ke UserRole type

  useEffect(() => {
    // Placeholder: simulasi tidak ada wallet connected
    setState({
      role: 'UNREGISTERED',
      userProfile: null,
      isLoading: false,
      isConnected: false,
      address: null,
    })
  }, [])

  return state
}
