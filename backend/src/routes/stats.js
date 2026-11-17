import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const PCT = 'ROUND(a.score * 100.0 / a.total, 1)';

// Totales globales de la plataforma
router.get('/overview', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT (SELECT COUNT(*) FROM users)::int AS users,
             COUNT(*)::int AS attempts,
             COALESCE(ROUND(AVG(a.score * 100.0 / a.total), 1), 0)::float AS "avgPct"
      FROM attempts a`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Ranking por promedio
router.get('/ranking', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.username,
             COUNT(a.id)::int AS attempts,
             ROUND(AVG(a.score * 100.0 / a.total), 1)::float AS "avgPct",
             MAX(${PCT})::float AS "bestPct"
      FROM users u JOIN attempts a ON a.user_id = u.id
      GROUP BY u.id
      ORDER BY "avgPct" DESC, attempts DESC
      LIMIT 10`);
    res.json(rows);
  } catch (err) { next(err); }
});

// Estadísticas de un usuario
router.get('/user/:username', async (req, res, next) => {
  try {
    const username = req.params.username.trim();
    const empty = { summary: { attempts: 0, avgPct: 0, bestPct: 0, avgSeconds: 0 }, history: [], byExam: [], hardest: [] };

    const user = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (!user.rows.length) return res.json(empty);
    const uid = user.rows[0].id;

    const summary = await pool.query(`
      SELECT COUNT(*)::int AS attempts,
             COALESCE(ROUND(AVG(a.score * 100.0 / a.total), 1), 0)::float AS "avgPct",
             COALESCE(MAX(${PCT}), 0)::float AS "bestPct",
             COALESCE(ROUND(AVG(a.duration_seconds)), 0)::int AS "avgSeconds"
      FROM attempts a WHERE a.user_id = $1`, [uid]);

    const history = await pool.query(`
      SELECT a.id, e.title AS exam, a.score, a.total, ${PCT}::float AS pct,
             a.duration_seconds AS "durationSeconds", a.finished_at AS "finishedAt"
      FROM attempts a JOIN exams e ON e.id = a.exam_id
      WHERE a.user_id = $1 ORDER BY a.finished_at DESC LIMIT 20`, [uid]);

    const byExam = await pool.query(`
      SELECT e.title AS exam, COUNT(a.id)::int AS attempts,
             ROUND(AVG(a.score * 100.0 / a.total), 1)::float AS "avgPct",
             MAX(${PCT})::float AS "bestPct"
      FROM attempts a JOIN exams e ON e.id = a.exam_id
      WHERE a.user_id = $1 GROUP BY e.id ORDER BY e.id`, [uid]);

    const hardest = await pool.query(`
      SELECT q.text AS question, e.title AS exam, COUNT(*)::int AS tries,
             ROUND(100.0 * SUM(CASE WHEN aa.is_correct THEN 1 ELSE 0 END) / COUNT(*), 0)::float AS "correctPct"
      FROM attempt_answers aa
      JOIN attempts a ON a.id = aa.attempt_id
      JOIN questions q ON q.id = aa.question_id
      JOIN exams e ON e.id = q.exam_id
      WHERE a.user_id = $1
      GROUP BY q.id, e.id
      HAVING SUM(CASE WHEN aa.is_correct THEN 0 ELSE 1 END) > 0
      ORDER BY "correctPct" ASC, tries DESC LIMIT 5`, [uid]);

    res.json({
      summary: summary.rows[0],
      history: history.rows,
      byExam: byExam.rows,
      hardest: hardest.rows,
    });
  } catch (err) { next(err); }
});

export default router;
