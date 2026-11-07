import { AdminOrderController } from '@/src/controllers/admin/order.controller';
import { OrderActionManager } from '@/src/views-components/admin/OrderActionManager';

export const revalidate = 0;

export default async function ShippedOrdersPage() {
  const vm = await AdminOrderController.getShippedOrdersViewModel();

  return (
    <OrderActionManager
      orders={vm.orders as any}
      title="KARGOYA VERİLEN SİPARİŞLER"
      subtitle="Kargo takip kodu atanmış ve dağıtım sürecinde olan siparişler"
      activeFilter="shipped"
    />
  );
}
