import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

// جلب السيرفرات
export async function GET() {
  try {
    const gateways = await db.streamGateway.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ gateways });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch gateways' }, { status: 500 });
  }
}

// إضافة سيرفر جديد
export async function POST(req: Request) {
  try {
    const { name, moviePattern, tvPattern } = await req.json();

    if (!name || !moviePattern || !tvPattern) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const count = await db.streamGateway.count();
    const newGateway = await db.streamGateway.create({
      data: {
        name,
        moviePattern,
        tvPattern,
        order: count + 1,
      },
    });

    return NextResponse.json({ success: true, gateway: newGateway });
  } catch {
    return NextResponse.json({ error: 'Failed to create gateway' }, { status: 500 });
  }
}

// حذف سيرفر
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.streamGateway.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete gateway' }, { status: 500 });
  }
}