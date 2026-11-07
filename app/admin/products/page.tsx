import { AdminProductController } from '@/src/controllers/admin/product.controller';
import { ProductTableManager } from '@/src/views-components/admin/ProductTableManager';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const vm = await AdminProductController.getProductsViewModel();

  return <ProductTableManager products={vm.products} />;
}
