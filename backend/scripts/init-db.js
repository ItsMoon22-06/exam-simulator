// Crea las tablas y carga los datos de ejemplo en Neon: npm run db:init
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../database');

try {
  for (const file of ['schema.sql', 'seed.sql']) {
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`✔ ${file} ejecutado`);
  }
  const { rows } = await pool.query('SELECT COUNT(*)::int AS exams FROM exams');
  console.log(`Base de datos lista con ${rows[0].exams} exámenes.`);
} catch (err) {
  console.error('Error inicializando la base de datos:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
