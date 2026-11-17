import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Recibe las respuestas, califica EN EL SERVIDOR y guarda el intento
router.post('/', async (req, res, next) => {
  const { username, examId, durationSeconds = 0, answers = [] } = req.body ?? {};
  const name = typeof username === 'string' ? username.trim() : '';

  if (name.length < 2 || name.length > 30) {
    return res.status(400).json({ error: 'El nombre debe tener entre 2 y 30 caracteres' });
  }
  if (!Number.isInteger(examId)) return res.status(400).json({ error: 'examId inválido' });
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers debe ser un arreglo' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const user = await client.query(
      `INSERT INTO users (username) VALUES ($1)
       ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username RETURNING id`, [name]);

    const { rows } = await client.query(
      `SELECT q.id AS qid, q.text AS qtext, q.explanation, q.position,
              o.id AS oid, o.text AS otext, o.is_correct
       FROM questions q JOIN options o ON o.question_id = q.id
       WHERE q.exam_id = $1 ORDER BY q.position, o.id`, [examId]);

    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Examen no encontrado' });
    }

    const questions = new Map();
    for (const r of rows) {
      if (!questions.has(r.qid)) {
        questions.set(r.qid, { id: r.qid, text: r.qtext, explanation: r.explanation, options: [] });
      }
      questions.get(r.qid).options.push({ id: r.oid, text: r.otext, isCorrect: r.is_correct });
    }

    const chosen = new Map(answers.map((a) => [Number(a.questionId), Number(a.optionId)]));
    let score = 0;
    const review = [...questions.values()].map((q) => {
      const selectedId = chosen.get(q.id) ?? null;
      const correct = q.options.find((o) => o.isCorrect);
      const isCorrect = selectedId !== null && selectedId === correct.id;
      if (isCorrect) score++;
      return { questionId: q.id, text: q.text, explanation: q.explanation,
               options: q.options, selectedId, correctId: correct.id, isCorrect };
    });

    const total = review.length;
    const secs = Math.max(0, Math.round(Number(durationSeconds) || 0));
    const attempt = await client.query(
      `INSERT INTO attempts (user_id, exam_id, score, total, duration_seconds)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, finished_at AS "finishedAt"`,
      [user.rows[0].id, examId, score, total, secs]);

    for (const r of review) {
      const valid = r.options.some((o) => o.id === r.selectedId) ? r.selectedId : null;
      await client.query(
        `INSERT INTO attempt_answers (attempt_id, question_id, option_id, is_correct) VALUES ($1,$2,$3,$4)`,
        [attempt.rows[0].id, r.questionId, valid, r.isCorrect]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      attemptId: attempt.rows[0].id, score, total,
      percentage: Math.round((score * 1000) / total) / 10,
      durationSeconds: secs, review,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

export default router;
