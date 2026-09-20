import { NextResponse } from 'next/server';

// متغيرات مؤقتة لحفظ الإعدادات في الذاكرة لتجربة الواجهة
// يجب استبدال هذا بربط حقيقي مع قاعدة البيانات (مثل Prisma أو Firebase)
let globalSettings = {
  maintenanceMode: false,
  defaultServer: "1"
};

// جلب الإعدادات الحالية عند تحميل الصفحة
export async function GET() {
  return NextResponse.json(globalSettings, { status: 200 });
}

// حفظ وتحديث الإعدادات عند الضغط على زر Save
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { maintenanceMode, defaultServer } = body;

    // تحديث الإعدادات (هنا تضع كود قاعدة البيانات الخاص بك)
    // مثال: await db.settings.update({ ... })
    globalSettings = { 
      maintenanceMode: maintenanceMode ?? globalSettings.maintenanceMode, 
      defaultServer: defaultServer ?? globalSettings.defaultServer 
    };

    return NextResponse.json(
      { success: true, message: 'Settings updated successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' }, 
      { status: 500 }
    );
  }
}