import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import Timer from './Timer.jsx';
import QuestionCard from './QuestionCard.jsx';

export default function ExamRunner({ examId, username, onFinish, onCancel }) {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});   // { [questionId]: optionId }
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const sentRef = useRef(false);

  useEffect(() => {
    api.getExam(examId)
      .then((data) => { setExam(data); setSecondsLeft(data.durationMinutes * 60); })
      .catch((e) => setError(e.message));
  }, [examId]);

  const submit = async () => {
    if (sentRef.current) return;
    sentRef.current = true;
    setSending(true);
    try {
      const result = await api.submitAttempt({
        username,
        examId,
        durationSeconds: exam.durationMinutes * 60 - secondsLeft,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId,
        })),
      });
      onFinish(result, exam.title);
    } catch (e) {
      sentRef.current = false;
      setSending(false);
      setError(e.message);
    }
  };

  // Cuenta regresiva; al llegar a cero se envía automáticamente
  useEffect(() => {
    if (secondsLeft === null || sentRef.current) return;
    if (secondsLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error && !exam) return <p className="alert">{error}</p>;
  if (!exam) return <p className="muted">Preparando examen…</p>;

  const total = exam.questions.length;
  const answered = Object.keys(answers).length;
  const current = exam.questions[index];

  const confirmSubmit = () => {
    const missing = total - answered;
    const msg = missing
      ? `Te faltan ${missing} pregunta(s) sin responder. ¿Enviar de todas formas?`
      : '¿Enviar el examen?';
    if (window.confirm(msg)) submit();
  };

  const cancel = () => {
    if (window.confirm('Si sales ahora se perderá este intento. ¿Salir del examen?')) onCancel();
  };

  return (
    <section>
      <div className="runner-bar">
        <div>
          <h2>{exam.title}</h2>
          <p className="muted">{answered} de {total} respondidas</p>
        </div>
        <Timer secondsLeft={secondsLeft} />
      </div>

      <div className="progress" aria-hidden="true">
        <div style={{ width: `${(answered / total) * 100}%` }} />
      </div>

      <div className="navigator" aria-label="Navegación entre preguntas">
        {exam.questions.map((q, i) => (
          <button
            key={q.id}
            className={`nav-dot ${i === index ? 'current' : ''} ${answers[q.id] ? 'done' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a la pregunta ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <QuestionCard
        question={current}
        index={index}
        total={total}
        selectedId={answers[current.id]}
        onSelect={(qid, oid) => setAnswers((a) => ({ ...a, [qid]: oid }))}
      />

      {error && <p className="alert">{error}</p>}

      <div className="runner-actions">
        <button className="btn" onClick={cancel} disabled={sending}>Salir</button>
        <span className="spacer" />
        <button className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>Anterior</button>
        {index < total - 1 ? (
          <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>Siguiente</button>
        ) : (
          <button className="btn btn-primary" onClick={confirmSubmit} disabled={sending}>
            {sending ? 'Enviando…' : 'Enviar examen'}
          </button>
        )}
      </div>
    </section>
  );
}
