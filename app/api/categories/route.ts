import { NextResponse } from 'next/server';
import { CategoryRepository } from '@/src/models/repositories/category.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tree = CategoryRepository.getTree();
    return NextResponse.json({ success: true, data: tree });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

