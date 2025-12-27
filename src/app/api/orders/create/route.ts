import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// HH:mm or H:mm -> HH:mm:ss
function toHms(t: string) {
  const m = (t || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const hh = String(Math.min(23, parseInt(m[1], 10))).padStart(2, '0');
  const mm = String(Math.min(59, parseInt(m[2], 10))).padStart(2, '0');
  const ss = String(Math.min(59, parseInt(m[3] ?? '0', 10))).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      carNum,
      carType,
      phone,
      driverName,
      customerName,
      customerId,
      internalId,
      dateISO,        // YYYY-MM-DD
      time,           // HH:mm
      locationId,     // BranchID
      locationName,
      services = [],
      comments = '',
    } = body;

    if (!carNum || !dateISO || !time || !locationId) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields (carNum/date/time/locationId)' },
        { status: 400 }
      );
    }

    const hms = toHms(time);
    if (!hms) {
      return NextResponse.json({ ok: false, error: 'Bad time format' }, { status: 400 });
    }

    const setDateIso = `${dateISO}T${hms}`;

    console.log('📥 Incoming appointment payload:', JSON.stringify(body, null, 2));
    const pool = await sql.connect(dbConfig);
    console.log('✅ Connected to DB');

    const name = `קביעת שטיפה${locationName ? ` - ${locationName}` : ''}`;
    const servicesText = Array.isArray(services) && services.length
      ? services.filter(Boolean).join(', ')
      : '';

    // ---- 1) Create the official booking in [Appointments]
    console.log('📝 Executing dbo.InsertAppointments with:', {
      BranchID: locationId,
      Name: name,
      AppointmentDate: dateISO,
      AppointmentTime: hms,
      CarNum: carNum,
      TypeOfCar: carType ?? '',
      DriverName: driverName ?? '',
      DriverPhone: phone ?? '',
      GenCustName: customerName ?? '',
      CustomerID: customerId ?? null,
      InternalID: internalId ?? null,
      Comments: (comments ? `${comments} ` : '') + (servicesText ? `שירותים: ${servicesText}` : ''),
    });

    await pool
      .request()
      .input('BranchID', sql.Int, Number(locationId))
      .input('Name', sql.NVarChar(150), name)
      .input('AppointmentDate', sql.Date, dateISO)
      .input('AppointmentTime', sql.VarChar(12), hms) // cast to time in proc
      .input('CarNum', sql.NVarChar(15), carNum)
      .input('TypeOfCar', sql.NVarChar(50), carType ?? '')
      .input('DriverName', sql.NVarChar(100), driverName ?? '')
      .input('DriverPhone', sql.NVarChar(15), phone ?? '')
      .input('GenCustName', sql.NVarChar(100), customerName ?? '')
      .input('CustomerID', sql.Int, customerId ?? null)
      .input('InternalID', sql.Int, internalId ?? null)
      .input(
        'Comments',
        sql.NVarChar(250),
        (comments ? `${comments} ` : '') + (servicesText ? `שירותים: ${servicesText}` : '')
      )
      .execute('dbo.InsertAppointments');

    console.log('✅ InsertAppointments executed');

    // Optional: fetch created id for a friendly orderId
    const after = await pool
      .request()
      .input('CarNum', sql.NVarChar(15), carNum)
      .input('AppointmentDate', sql.Date, dateISO)
      .input('AppointmentTime', sql.VarChar(12), hms)
      .query(`
        SELECT TOP 1 AppointmentID, AppointmentDate, AppointmentTime, InsertDate
        FROM [Wash].[dbo].[Appointments]
        WHERE CarNum = @CarNum
          AND AppointmentDate = @AppointmentDate
          AND AppointmentTime = CAST(@AppointmentTime AS time)
        ORDER BY InsertDate DESC
      `);

    const appointmentId: number | null = after.recordset?.[0]?.AppointmentID ?? null;
    const orderId = appointmentId ? `CC-${appointmentId}` : null;
    console.log('🔎 Select after insert result:', after.recordset);

    // ---- 2) Mirror into [InfoForAppointments] (UPSERT)
    const mirror = {
      CustomerID: customerId ?? 999999,
      InternalID: internalId ?? 1,
      CarNum: carNum,
      PhoneN: (phone ?? '').toString(),
      TypeOfCar: carType ?? '',
      SetDate: new Date(setDateIso),
      AttachedNum: null as string | null,
      DriverName: driverName ?? '',
      CostomerName: customerName ?? '',
    };
    console.log('📝 Mirroring to InfoForAppointments (try insert):', {
      ...mirror,
      SetDate: mirror.SetDate.toISOString(),
    });

    try {
      await pool
        .request()
        .input('CustomerID', sql.Int, mirror.CustomerID)
        .input('InternalID', sql.Int, mirror.InternalID)
        .input('CarNum', sql.NVarChar(50), mirror.CarNum)
        .input('PhoneN', sql.NVarChar(50), mirror.PhoneN)
        .input('TypeOfCar', sql.NVarChar(50), mirror.TypeOfCar)
        .input('SetDate', sql.DateTime, mirror.SetDate)
        .input('AttachedNum', sql.NVarChar(50), mirror.AttachedNum)
        .input('DriverName', sql.NVarChar(50), mirror.DriverName)
        .input('CostomerName', sql.NVarChar(150), mirror.CostomerName)
        .execute('dbo.InsertInfoCarPhoneForAppointments');

      console.log('✅ Mirror insert succeeded');
    } catch (e: any) {
      // 2627 = PK violation, 2601 = unique index violation
      if (e?.number === 2627 || e?.number === 2601) {
        console.warn('↩️ Duplicate key on InfoForAppointments, running UPDATE instead…', {
          number: e?.number,
          message: e?.message,
        });

        const upd = await pool
          .request()
          .input('CustomerID', sql.Int, mirror.CustomerID)
          .input('InternalID', sql.Int, mirror.InternalID)
          .input('CarNum', sql.NVarChar(50), mirror.CarNum)
          .input('PhoneN', sql.NVarChar(50), mirror.PhoneN)
          .input('TypeOfCar', sql.NVarChar(50), mirror.TypeOfCar)
          .input('SetDate', sql.DateTime, mirror.SetDate)
          .input('DriverName', sql.NVarChar(50), mirror.DriverName)
          .input('CostomerName', sql.NVarChar(150), mirror.CostomerName)
          .query(`
            UPDATE [Wash].[dbo].[InfoForAppointments]
            SET
              [SetDate] = @SetDate,
              [TypeOfCar] = @TypeOfCar,
              [DriverName] = @DriverName,
              [CostomerName] = @CostomerName
            WHERE
              [CustomerID] = @CustomerID
              AND [InternalID] = @InternalID
              AND [CarNum] = @CarNum
              AND [PhoneN] = @PhoneN
          `);

        console.log('✅ Mirror UPDATE rowsAffected:', upd.rowsAffected);
      } else {
        console.error('❌ Mirror insert failed (unexpected):', e);
        // We still return ok:true because the real booking succeeded.
        // If you prefer to fail the whole request, rethrow here.
      }
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (err: any) {
    console.error('orders/create error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
