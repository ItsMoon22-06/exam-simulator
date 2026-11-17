import { formatTime } from '../api.js';

export default function ResultView({ result, examTitle, onRetry, onStats }) {
  const { score, total, percentage, durationSeconds, review } = result;
  const verdict = percentage >= 80 ? 'Excelente resultado' : percentage >= 60 ? 'Aprobado, con margen de mejora' : 'Necesitas repasar';

  return (
    <section>
      <div className="card result-head">
        <div>
          <p className="muted">{examTitle}</p>
          <h2>{verdict}</h2>
          <p>Respondiste bien {score} de {total} preguntas en {formatTime(durationSeconds)}.</p>
        </div>
        <div className="score" aria-label={`Puntaje ${percentage} por ciento`}>{percentage}%</div>
      </div>

      <div className="runner-actions">
        <button className="btn btn-primary" onClick={onRetry}>Hacer otro examen</button>
        <button className="btn" onClick={onStats}>Ver mis estadísticas</button>
      </div>

      <h3>Revisión de respuestas</h3>
      {review.map((q, i) => (
        <article className={`card review ${q.isCorrect ? 'ok' : 'bad'}`} key={q.questionId}>
          <p className="muted">
            {i + 1}. {q.isCorrect ? 'Correcta' : q.selectedId ? 'Incorrecta' : 'Sin responder'}
          </p>
          <h4>{q.text}</h4>
          <ul>
            {q.options.map((o) => {
              const isCorrect = o.id === q.correctId;
              const isChosen = o.id === q.selectedId;
              return (
                <li key={o.id} className={isCorrect ? 'right' : isChosen ? 'wrong' : ''}>
                  {o.text}
                  {isCorrect && <em> — respuesta correcta</em>}
                  {isChosen && !isCorrect && <em> — tu respuesta</em>}
                </li>
              );
            })}
          </ul>
          {q.explanation && <p className="explain">{q.explanation}</p>}
        </article>
      ))}
    </section>
  );
}
