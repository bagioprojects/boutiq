import { NextRequest, NextResponse } from 'next/server';
import { CategoryRepository } from '@/src/models/repositories/category.repository';
import { SessionService } from '@/src/core/security/session.service';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('fk_admin_token')?.value || req.cookies.get('fk_token')?.value;
  if (!token) return false;
  const payload = SessionService.verifyToken(token);
  return !!(payload && payload.role === 'admin');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    if (view === 'tree') {
      const tree = CategoryRepository.getTree();
      return NextResponse.json({ success: true, data: tree });
    }

    const all = CategoryRepository.getAll();
    const tree = CategoryRepository.getTree();
    return NextResponse.json({ success: true, data: { all, tree } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler kategori ekleyebilir.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, slug, parent_id, sort_order, is_active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Kategori adı gereklidir.' }, { status: 400 });
    }

    const cleanSlug = slug && slug.trim() 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const created = CategoryRepository.create({
      name: name.trim(),
      slug: cleanSlug,
      parent_id: parent_id ? Number(parent_id) : null,
      sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler kategori düzenleyebilir.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, name, slug, parent_id, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Kategori ID gereklidir.' }, { status: 400 });
    }

    const updated = CategoryRepository.update(Number(id), {
      name: name !== undefined ? name.trim() : undefined,
      slug: slug !== undefined ? slug.trim() : undefined,
      parent_id: parent_id === null ? null : (parent_id !== undefined ? Number(parent_id) : undefined),
      sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Kategori bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler sıralama değiştirebilir.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, direction, items } = body;

    // 1. Sürükle-bırak için Toplu Sıralama (Batch Reorder)
    if (Array.isArray(items) && items.length > 0) {
      const ok = CategoryRepository.batchReorder(items);
      return NextResponse.json({ success: ok, message: 'Toplu sıralama güncellendi.' });
    }

    // 2. Tekil Yukarı/Aşağı Buton Sıralaması
    if (!id || (direction !== 'up' && direction !== 'down')) {
      return NextResponse.json({ success: false, error: 'Geçersiz parametreler (id, direction veya items).' }, { status: 400 });
    }

    const ok = CategoryRepository.reorder(Number(id), direction);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Sıra değiştirilemedi veya zaten sınırda.' }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Sıralama güncellendi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim. Sadece yöneticiler kategori silebilir.' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Kategori ID gereklidir.' }, { status: 400 });
    }

    const ok = CategoryRepository.delete(Number(id));
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Kategori bulunamadı veya silinemedi.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Kategori başarıyla silindi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

