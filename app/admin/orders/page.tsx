import { AdminOrderController } from '@/src/controllers/admin/order.controller';
import { OrderActionManager } from '@/src/views-components/admin/OrderActionManager';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const vm = await AdminOrderController.getAllOrdersViewModel();

  return (
    <OrderActionManager
      orders={vm.orders as any}
      title="SİPARİŞLER"
      subtitle="Tüm müşteri siparişleri ve kargo gönderim yönetimi"
      activeFilter="all"
    />
  );
}
