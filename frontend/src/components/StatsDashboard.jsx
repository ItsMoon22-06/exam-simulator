import { useEffect, useState } from 'react';
import { api, formatTime } from '../api.js';
import BarChart from './BarChart.jsx';
import Trend from './Trend.jsx';

const Stat = ({ label, value }) => (
  <div className="stat">
    <dd>{value}</dd>
    <dt>{label}</dt>
  </div>
);

export default function StatsDashboard({ username }) {
  const [data, setData] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getUserStats(username), api.getRanking(), api.getOverview()])
      .then(([u, r, o]) => { setData(u); setRanking(r); setOverview(o); })
      .catch((e) => setError(e.message));
  }, [username]);

  if (error) return <p className="alert">{error}</p>;
  if (!data) return <p className="muted">Cargando estadísticas…</p>;

  const { summary, history, byExam, hardest } = data;

  if (!summary.attempts) {
    return (
      <section>
        <h2>Mis estadísticas</h2>
        <p className="muted">Aún no has completado ningún examen. Cuando termines el primero, aquí verás tu promedio, tu evolución y las preguntas que más fallas.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Estadísticas de {username}</h2>

      <dl className="stats-row">
        <Stat label="Exámenes realizados" value={summary.attempts} />
        <Stat label="Promedio" value={`${summary.avgPct}%`} />
        <Stat label="Mejor resultado" value={`${summary.bestPct}%`} />
        <Stat label="Tiempo medio" value={formatTime(summary.avgSeconds)} />
      </dl>

      <div className="two-col">
        <div className="card">
          <h3>Evolución por intento</h3>
          <Trend history={history} />
        </div>
        <div className="card">
          <h3>Promedio por examen</h3>
          <BarChart items={byExam} labelKey="exam" valueKey="avgPct" />
        </div>
      </div>

      <div className="card">
        <h3>Preguntas que más fallas</h3>
        {hardest.length === 0 ? (
          <p className="muted">No has fallado ninguna pregunta. ¡Sigue así!</p>
        ) : (
          <ul className="hardest">
            {hardest.map((h, i) => (
              <li key={i}>
                <span>{h.question}<small>{h.exam}</small></span>
                <b>{h.correctPct}% acierto</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Historial</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Examen</th><th>Nota</th><th>Tiempo</th><th>Fecha</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.exam}</td>
                    <td>{h.score}/{h.total} ({h.pct}%)</td>
                    <td>{formatTime(h.durationSeconds)}</td>
                    <td>{new Date(h.finishedAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Ranking de la plataforma</h3>
          {overview && (
            <p className="muted">{overview.users} usuarios · {overview.attempts} intentos · promedio {overview.avgPct}%</p>
          )}
          <ol className="ranking">
            {ranking.map((r) => (
              <li key={r.username} className={r.username === username ? 'me' : ''}>
                <span>{r.username}</span>
                <b>{r.avgPct}%</b>
                <small>{r.attempts} intentos</small>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
