import { db } from '@/lib/db';
import { StockManagementClient, ProductStockItem, StockMetrics } from './StockManagementClient';

export const revalidate = 0;

export default async function AdminStockPage() {
  const rows = db
    .prepare(
      'SELECT id, name, sku, category, price, price_num, stock, image, is_active FROM products ORDER BY stock ASC, id DESC'
    )
    .all() as any[];

  let totalStock = 0;
  let criticalStockCount = 0;
  let outOfStockCount = 0;
  let inStockCount = 0;

  const products: ProductStockItem[] = rows.map((p) => {
    const stock = typeof p.stock === 'number' ? p.stock : Number(p.stock) || 0;
    totalStock += stock;
    if (stock === 0) {
      outOfStockCount++;
    } else if (stock <= 10) {
      criticalStockCount++;
    } else {
      inStockCount++;
    }

    return {
      id: p.id,
      name: p.name,
      sku: p.sku || `FK-${p.id}`,
      category: p.category || 'Genel',
      price: p.price_num || (typeof p.price === 'number' ? p.price : 0),
      priceFormatted: p.price || `${p.price_num || 0} ₺`,
      stock: stock,
      image: p.image || '/images/default.jpg',
      isActive: Boolean(p.is_active),
    };
  });

  const metrics: StockMetrics = {
    totalProducts: products.length,
    totalStock,
    inStockCount,
    criticalStockCount,
    outOfStockCount,
  };

  return <StockManagementClient initialProducts={products} initialMetrics={metrics} />;
}

