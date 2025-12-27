// src/app/api/car/phones-by-car/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/car/phones-by-car?carNum=1234567
// Returns DISTINCT phone numbers that have appointments info for this car number
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const carNumRaw = (searchParams.get('carNum') || '').trim();
        const carNum = carNumRaw.replace(/\D/g, '').slice(0, 8);

        if (!carNum || carNum.length < 6) {
            return NextResponse.json(
                { error: 'carNum is required (6-8 digits)' },
                { status: 400 }
            );
        }

        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        request.input('CarNum', sql.VarChar, carNum);

        // If you want strictly "appointments" table - change FROM/WHERE accordingly.
        // This matches your existing pattern: InfoForAppointments.
        const result = await request.query(`
      SELECT DISTINCT
        PhoneN
      FROM Wash.dbo.InfoForAppointments
      WHERE CarNum = @CarNum
        AND PhoneN IS NOT NULL
        AND LTRIM(RTRIM(PhoneN)) <> ''
      ORDER BY PhoneN
    `);

        const phones = (result.recordset || [])
            .map((r: any) => (r.PhoneN ? String(r.PhoneN).trim() : ''))
            .filter(Boolean);

        return NextResponse.json(phones);
    } catch (err) {
        console.error('❌ /api/car/phones-by-car error:', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
