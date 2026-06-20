import { MetricCard } from "@/components/dashboard/MetricCard"
import { ActivityChart } from "@/components/dashboard/ActivityChart"
import { ExaminationPieChart } from "@/components/dashboard/ExaminationPieChart"
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable"

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          MediChain Radiology — Administrator Panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value="0"
          subtitle="Registered patients"
        />

        <MetricCard
          title="Total CT Scans"
          value="0"
          subtitle="On-chain records"
        />

        <MetricCard
          title="Total X-Rays"
          value="0"
          subtitle="On-chain records"
        />

        <MetricCard
          title="On-chain Verified"
          value="100%"
          subtitle="Integrity verified"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <ExaminationPieChart />
      </div>

      <RecentActivityTable />
    </div>
  )
}