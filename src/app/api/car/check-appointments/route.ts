import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';     // mssql needs Node runtime
export const revalidate = 0;         // always query DB (no cache)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const carNum = (searchParams.get('carNum') || '').trim();

  if (!carNum) {
    return NextResponse.json({ error: 'Missing carNum' }, { status: 400 });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('CarNum', sql.NVarChar(50), carNum)
      .query(`
        SELECT TOP 1 SetDate
        FROM [Wash].[dbo].[InfoForAppointments]
        WHERE CarNum = @CarNum
          AND SetDate >= SYSDATETIME()
        ORDER BY SetDate ASC
      `);

    const row = result.recordset?.[0];
    return NextResponse.json({
      hasBooking: !!row,
      nextDate: row ? new Date(row.SetDate).toISOString() : null,
    });
  } catch (err: any) {
    console.error('check-appointments error:', err);
    return NextResponse.json({ error: 'DB error', details: err.message }, { status: 500 });
  }
}
