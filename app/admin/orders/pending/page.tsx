import { AdminOrderController } from '@/src/controllers/admin/order.controller';
import { OrderActionManager } from '@/src/views-components/admin/OrderActionManager';

export const revalidate = 0;

export default async function PendingOrdersPage() {
  const vm = await AdminOrderController.getPendingOrdersViewModel();

  return (
    <OrderActionManager
      orders={vm.orders as any}
      title="HAZIRLANAN SİPARİŞLER"
      subtitle="Kargoya verilmek üzere paketleme ve hazırlık aşamasındaki siparişler"
      activeFilter="pending"
    />
  );
}
