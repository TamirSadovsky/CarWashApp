// src/app/api/car/check-car-phone/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs'; // Ensure Node runtime

export async function POST(req: Request) {
  const { carNum, phone } = await req.json();

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('CarNum', sql.NVarChar(50), carNum ? `%${carNum}%` : '')
      .input('PhoneN', sql.NVarChar(50), phone ? `%${phone}%` : '')
      .execute('dbo.CheckCarPhoneForAppointments');

    const mappedRecords = result.recordset.map((r) => ({
      CostomerName: r.CostomerName?.trim() || '',
      DriverName: r.DriverName?.trim() || '',
      CarNum: r.CarNum?.trim() || '',
      CarType: r.TypeOfCar?.trim() || '',
      Phone: r.PhoneN?.trim() || '',
    }));

    return NextResponse.json(mappedRecords);
  } catch (err: any) {
    console.error('❌ DB error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}
