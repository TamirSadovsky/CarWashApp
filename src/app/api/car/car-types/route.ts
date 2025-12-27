// src/app/api/car/car-types/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db'; // וודא שהנתיב נכון אצלך

export async function GET() {
  try {
    const pool = await sql.connect(dbConfig);

    // מריץ את הפרוצדורה ומחזיר את העמודה [Dis]
    const result = await pool.request().query('EXEC dbo.CarTypeList');

    // מצפה ל-recordset בסגנון: [{ Dis: '...' }, ...]
    const types: string[] = (result?.recordset ?? [])
      .map((r: any) => (r?.Dis ?? '').toString().trim())
      .filter(Boolean);

    return NextResponse.json({ types }, { status: 200 });
  } catch (err: any) {
    console.error('❌ car-types error:', err);
    return NextResponse.json(
      { error: 'Database error', details: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
