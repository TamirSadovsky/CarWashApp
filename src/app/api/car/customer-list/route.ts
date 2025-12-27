// src/app/api/car/customer-list/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/car/customer-list
// - If ?phone= is provided: returns ALL cars for that phone (array of UserData-like objects)
// - If no phone: returns distinct customer names (legacy behavior)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = (searchParams.get('phone') || '').trim();

    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    if (phone) {
      request.input('PhoneN', sql.VarChar, phone);

      const result = await request.query(`
        SELECT DISTINCT
          CarNum,
          PhoneN,
          TypeOfCar,
          DriverName,
          CostomerName
        FROM Wash.dbo.InfoForAppointments
        WHERE PhoneN = @PhoneN
        ORDER BY CarNum
      `);

      // Normalize to your front-end shape
      const rows = (result.recordset || []).map((r: any) => ({
        CarNum: r.CarNum ? String(r.CarNum).trim() : '',
        Phone: r.PhoneN ? String(r.PhoneN).trim() : '',
        CarType: r.TypeOfCar ? String(r.TypeOfCar).trim() : '',
        DriverName: r.DriverName ? String(r.DriverName).trim() : undefined,
        CostomerName: r.CostomerName ? String(r.CostomerName).trim() : undefined,
      }));

      return NextResponse.json(rows);
    }

    // Fallback: legacy behavior (distinct customer names)
    const result = await request.query(`
      SELECT DISTINCT CostomerName
      FROM Wash.dbo.InfoForAppointments
      WHERE CostomerName IS NOT NULL AND LTRIM(RTRIM(CostomerName)) <> ''
      ORDER BY CostomerName
    `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('❌ /api/car/customer-list error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
