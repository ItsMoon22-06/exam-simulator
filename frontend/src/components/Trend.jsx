// Evolución de los últimos intentos (SVG, más antiguo a la izquierda)
export default function Trend({ history }) {
  const data = [...history].reverse().slice(-12);
  if (data.length < 2) return <p className="muted">Haz al menos dos exámenes para ver tu evolución.</p>;

  const W = 560, H = 160, P = 24;
  const x = (i) => P + (i * (W - 2 * P)) / (data.length - 1);
  const y = (v) => H - P - (v / 100) * (H - 2 * P);
  const points = data.map((d, i) => `${x(i)},${y(d.pct)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend" role="img" aria-label="Evolución del porcentaje por intento">
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={P} x2={W - P} y1={y(g)} y2={y(g)} className="grid-line" />
          <text x={4} y={y(g) + 4} className="axis">{g}</text>
        </g>
      ))}
      <polyline points={points} className="trend-line" />
      {data.map((d, i) => (
        <circle key={d.id} cx={x(i)} cy={y(d.pct)} r="4.5" className="trend-dot">
          <title>{`${d.exam}: ${d.pct}%`}</title>
        </circle>
      ))}
    </svg>
  );
}
