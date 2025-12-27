// app/api/car/snif-list/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db'; // עדכן את הנתיב לפי מיקום הקובץ שלך

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute('dbo.SnifList');

    const branches = (result?.recordset || []).map((r: any) => ({
      id: Number(r.WearhouseNum),
      name: (r.Des || '').trim(),
    }));

    return NextResponse.json(branches);
  } catch (err: any) {
    console.error('❌ Error fetching branches:', err);
    return NextResponse.json(
      { error: 'Database error', details: err.message },
      { status: 500 }
    );
  }
}
