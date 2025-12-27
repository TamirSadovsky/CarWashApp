// src/app/api/car/register-new-client/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { CostomerName, DriverName, carNum, TypeOfCar, phone } = await req.json();

  if (!CostomerName || !DriverName || !carNum || !TypeOfCar) {
    return NextResponse.json({ error: 'יש למלא את כל השדות' }, { status: 400 });
  }

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('CustomerID', sql.Int, 999999)
      .input('InternalID', sql.Int, 1)
      .input('CarNum', sql.NVarChar(50), carNum)
      .input('PhoneN', sql.NChar(50), phone)
      .input('TypeOfCar', sql.NVarChar(50), TypeOfCar || 'לא צויין')
      .input('SetDate', sql.DateTime, new Date())
      .input('AttachedNum', sql.NVarChar(50), null)
      .input('DriverName', sql.NVarChar(50), DriverName)
      .input('CostomerName', sql.NVarChar(150), CostomerName)
      .execute('dbo.InsertInfoCarPhoneForAppointments');

    const result = await pool.request()
      .input('CarNum', sql.NVarChar(50), `%${carNum}%`)
      .input('PhoneN', sql.NVarChar(50), `%${phone}%`)
      .execute('dbo.CheckCarPhoneForAppointments');

    return NextResponse.json(result.recordset, { status: 201 });
  } catch (err: any) {
    console.error('❌ Registration error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}
