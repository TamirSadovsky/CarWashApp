// src/lib/db.ts
import sql from 'mssql';

export const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER!,          // למשל: "81.218.xx.xx"
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_DATABASE,
  options: { encrypt: false, trustServerCertificate: true },
};
