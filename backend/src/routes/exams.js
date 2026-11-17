import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Lista de exámenes con métricas globales
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.title, e.description, e.category,
             e.duration_minutes AS "durationMinutes",
             (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id)::int AS "questionCount",
             COUNT(a.id)::int AS attempts,
             COALESCE(ROUND(AVG(a.score * 100.0 / NULLIF(a.total, 0)), 1), 0)::float AS "avgPct"
      FROM exams e
      LEFT JOIN attempts a ON a.exam_id = e.id
      GROUP BY e.id
      ORDER BY e.id`);
    res.json(rows);
  } catch (err) { next(err); }
});

// Examen con preguntas y opciones (SIN revelar la respuesta correcta)
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id de examen inválido' });

    const exam = await pool.query(
      `SELECT id, title, description, category, duration_minutes AS "durationMinutes" FROM exams WHERE id = $1`, [id]);
    if (!exam.rows.length) return res.status(404).json({ error: 'Examen no encontrado' });

    const { rows } = await pool.query(
      `SELECT q.id AS "questionId", q.text AS "questionText", q.position,
              o.id AS "optionId", o.text AS "optionText"
       FROM questions q JOIN options o ON o.question_id = q.id
       WHERE q.exam_id = $1 ORDER BY q.position, o.id`, [id]);

    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.questionId)) map.set(r.questionId, { id: r.questionId, text: r.questionText, options: [] });
      map.get(r.questionId).options.push({ id: r.optionId, text: r.optionText });
    }
    const questions = shuffle([...map.values()]).map((q) => ({ ...q, options: shuffle(q.options) }));
    res.json({ ...exam.rows[0], questions });
  } catch (err) { next(err); }
});

export default router;
