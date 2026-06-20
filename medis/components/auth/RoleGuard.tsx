'use client'

import type { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ children, fallback }: RoleGuardProps) {
  // Full implementation in Sesi 4
  return <>{fallback ?? children}</>
}
