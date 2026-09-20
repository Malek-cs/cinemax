import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma'; // تأكد أن هذا مسار Prisma الصحيح في مشروعك

// 1. جلب السيرفرات (GET)
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

// 2. إضافة سيرفر جديد (POST)
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

// 3. حذف سيرفر (DELETE)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // هذه الحيلة تضمن عمل الحذف سواء كان الـ id في قاعدة البيانات رقماً أو نصاً (UUID/CUID)
    const gatewayId = isNaN(Number(id)) ? id : Number(id);

    await db.streamGateway.delete({ 
      where: { id: gatewayId as any } 
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete gateway' }, { status: 500 });
  }
}