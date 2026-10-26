import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { TradeOrderReview } from "@/components/admin/trade-order-review"
import { getServerTradeOrderUseCases } from "@/src/modules/trading/composition/server"

export default async function AdminTransactionsPage() {
  const { listAllOrders } = await getServerTradeOrderUseCases()
  const orders = await listAllOrders()

  return (
    <AdminDashboard>
      <TradeOrderReview orders={orders} />
    </AdminDashboard>
  )
}
