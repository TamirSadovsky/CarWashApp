// app/api/works/by-car-type/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const carType = req.nextUrl.searchParams.get('carType');
  if (!carType) {
    return NextResponse.json({ error: 'חסר carType' }, { status: 400 });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input('CarType', sql.NVarChar(50), carType)
      .execute('dbo.FindWorksForCarType');

    const rows = (result.recordset || []).map((r: any) => ({
      id: r.WorkTypeID,
      groupId: r.GroupId,
      name: r.WorkDescription,
      carType: r.CarType,
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error('❌ Works by car type error:', err);
    return NextResponse.json(
      { error: 'Database error', details: err.message },
      { status: 500 }
    );
  }
}
