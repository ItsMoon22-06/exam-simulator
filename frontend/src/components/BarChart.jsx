// Gráfico de barras horizontal simple (valores en porcentaje, 0–100)
export default function BarChart({ items, valueKey = 'value', labelKey = 'label' }) {
  if (!items.length) return <p className="muted">Sin datos todavía.</p>;
  return (
    <ul className="bars">
      {items.map((it, i) => {
        const v = Math.max(0, Math.min(100, it[valueKey]));
        return (
          <li key={i}>
            <span className="bar-label">{it[labelKey]}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${v}%` }} /></span>
            <span className="bar-value">{v}%</span>
          </li>
        );
      })}
    </ul>
  );
}
