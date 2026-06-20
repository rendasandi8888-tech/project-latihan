import { RoleGuard } from '@/components/auth/RoleGuard'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT']}>
      <div className="min-h-screen bg-[#F8F9FB]">
        <Sidebar />
        <div className="ml-[220px] flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}