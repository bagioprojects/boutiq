import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('fk_admin_token')?.value || req.cookies.get('fk_token')?.value;
  if (!token) return false;
  const payload = SessionService.verifyToken(token);
  return !!(payload && payload.role === 'admin');
}

export async function GET(req: NextRequest) {
  try {
    const products = db
      .prepare(
        'SELECT id, name, sku, category, price, price_num, stock, image, is_active FROM products ORDER BY stock ASC, id DESC'
      )
      .all() as any[];

    let totalStock = 0;
    let criticalStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    const formattedProducts = products.map((p) => {
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

    const metrics = {
      totalProducts: products.length,
      totalStock,
      inStockCount,
      criticalStockCount,
      outOfStockCount,
    };

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, message: 'Yetkisiz erişim. Sadece yöneticiler stok güncelleyebilir.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    // Single item update
    if (body.id !== undefined && body.stock !== undefined) {
      const id = Number(body.id);
      const stock = Math.max(0, parseInt(body.stock, 10) || 0);

      const res = db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock, id);
      if (res.changes === 0) {
        return NextResponse.json({ success: false, message: 'Ürün bulunamadı.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Stok başarıyla güncellendi.',
        id,
        stock,
      });
    }

    // Bulk update
    if (Array.isArray(body.updates)) {
      const stmt = db.prepare('UPDATE products SET stock = ? WHERE id = ?');
      let updatedCount = 0;

      for (const item of body.updates) {
        if (item.id && item.stock !== undefined) {
          const s = Math.max(0, parseInt(item.stock, 10) || 0);
          stmt.run(s, Number(item.id));
          updatedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `${updatedCount} ürünün stoğu güncellendi.`,
        updatedCount,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Geçersiz parametreler. "id" ve "stock" gereklidir.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

