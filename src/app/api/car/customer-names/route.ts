// src/app/api/car/customer-names/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/car/customer-names
// Returns: string[] (customer names) - for the dropdown only
export async function GET() {
    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();

        const result = await request.query(`
      SELECT DISTINCT
        LTRIM(RTRIM([Name])) AS CustomerName
      FROM Wash.dbo.Customers
      WHERE [Name] IS NOT NULL
        AND LTRIM(RTRIM([Name])) <> ''
        AND ISNULL([NotActive], 0) = 0
      ORDER BY LTRIM(RTRIM([Name]))
    `);

        const names = (result.recordset || [])
            .map((r: any) => (r?.CustomerName ?? '').toString().trim())
            .filter(Boolean);

        return NextResponse.json(names);
    } catch (err) {
        console.error('❌ /api/car/customer-names error:', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
