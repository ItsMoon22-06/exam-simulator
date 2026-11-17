const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Las opciones se marcan como en una hoja de respuestas: la burbuja se rellena al elegir
export default function QuestionCard({ question, index, total, selectedId, onSelect }) {
  return (
    <div className="card question">
      <p className="muted">Pregunta {index + 1} de {total}</p>
      <h2>{question.text}</h2>
      <div className="options" role="radiogroup" aria-label={question.text}>
        {question.options.map((opt, i) => (
          <button
            key={opt.id}
            role="radio"
            aria-checked={selectedId === opt.id}
            className={`option ${selectedId === opt.id ? 'selected' : ''}`}
            onClick={() => onSelect(question.id, opt.id)}
          >
            <span className="bubble">{LETTERS[i]}</span>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
