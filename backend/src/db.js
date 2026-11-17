import 'dotenv/config';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL. Copia backend/.env.example a backend/.env y agrega tu cadena de Neon.');
  process.exit(1);
}

// Neon exige SSL. rejectUnauthorized:false evita problemas de certificados en hosting.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});
