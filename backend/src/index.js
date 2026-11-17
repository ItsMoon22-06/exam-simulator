import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import examsRouter from './routes/exams.js';
import attemptsRouter from './routes/attempts.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: 'error', database: 'unreachable' });
  }
});

app.use('/api/exams', examsRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/stats', statsRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Despliegue unificado: Express sirve el build de React (frontend/dist)
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Manejador de errores
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
