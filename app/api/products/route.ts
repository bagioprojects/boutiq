import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/src/models/repositories/product.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const activeParam = searchParams.get('active_only') ?? searchParams.get('active');
    const activeOnly = activeParam !== 'false' && activeParam !== '0';

    const products = ProductRepository.getAll({ category, search, activeOnly });
    return NextResponse.json({
      success: true,
      products,
      data: products,
      total: products.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, products: [] }, { status: 500 });
  }
}
