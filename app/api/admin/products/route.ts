import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/src/models/repositories/product.repository';
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
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const activeOnly = searchParams.get('active') === 'true';

    const products = ProductRepository.getAll({ category, search, activeOnly });
    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler ürün ekleyebilir.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, category, price, stock, image, sizes, badge, is_active } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { success: false, message: 'Ürün adı, kategorisi ve fiyatı zorunludur.' },
        { status: 400 }
      );
    }

    const id = ProductRepository.create({
      name,
      category,
      price: Number(price) || 0,
      stock: stock !== undefined ? Number(stock) : 50,
      image,
      sizes,
      badge: badge !== undefined ? badge : null,
      is_active: is_active !== undefined ? Number(is_active) : 1,
    });

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla eklendi.',
      id,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler ürün güncelleyebilir.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, name, category, price, stock, image, badge, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Güncellenecek ürün ID gereklidir.' },
        { status: 400 }
      );
    }

    const updated = ProductRepository.update(Number(id), {
      name,
      category,
      price: price !== undefined ? Number(price) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      image,
      badge: badge !== undefined ? badge : undefined,
      is_active: is_active !== undefined ? Number(is_active) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ürün başarıyla güncellendi.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler ürün silebilir.' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Silinecek ürün ID gereklidir.' },
        { status: 400 }
      );
    }

    ProductRepository.delete(Number(id));
    return NextResponse.json({ success: true, message: 'Ürün başarıyla silindi.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

