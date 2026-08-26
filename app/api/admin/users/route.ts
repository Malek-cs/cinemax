import { NextResponse } from 'next/server';
import { db } from '../../../../lib/prisma';

// جلب قائمة المستخدمين
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// تحديث حالة المستخدم أو رتبته
export async function PATCH(req: Request) {
  try {
    const { userId, role, isBanned } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(isBanned !== undefined && { isBanned }),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}