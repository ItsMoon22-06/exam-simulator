import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function ExamList({ onStart }) {
  const [exams, setExams] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getExams().then(setExams).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!exams) return <p className="muted">Cargando exámenes…</p>;
  if (!exams.length) return <p className="muted">Todavía no hay exámenes. Carga los datos de ejemplo con npm run db:init.</p>;

  return (
    <section>
      <h2>Elige un examen</h2>
      <div className="grid">
        {exams.map((exam) => (
          <article className="card exam-card" key={exam.id}>
            <span className="tag">{exam.category}</span>
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <dl className="facts">
              <div><dt>Preguntas</dt><dd>{exam.questionCount}</dd></div>
              <div><dt>Tiempo</dt><dd>{exam.durationMinutes} min</dd></div>
              <div><dt>Promedio global</dt><dd>{exam.attempts ? `${exam.avgPct}%` : '—'}</dd></div>
            </dl>
            <button className="btn btn-primary" onClick={() => onStart(exam.id)}>Comenzar examen</button>
          </article>
        ))}
      </div>
    </section>
  );
}
