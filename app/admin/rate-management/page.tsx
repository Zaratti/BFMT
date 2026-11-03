import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { FeeTierManagement } from "@/components/admin/fee-tier-management"

export default function AdminRateManagementPage() {
  return (
    <AdminDashboard>
      <FeeTierManagement />
    </AdminDashboard>
  )
}
