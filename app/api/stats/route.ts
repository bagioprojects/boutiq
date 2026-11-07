import { NextResponse } from 'next/server';
import { AdminDashboardController } from '@/src/controllers/admin/dashboard.controller';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vm = await AdminDashboardController.getDashboardViewModel();
    const avgBasket = vm.totalOrders > 0 ? vm.totalRevenue / vm.totalOrders : 0;

    return NextResponse.json({
      total_revenue: vm.totalRevenue,
      total_orders: vm.totalOrders,
      active_products: vm.activeProducts,
      pending_returns: vm.pendingReturns,
      avg_basket: avgBasket,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
