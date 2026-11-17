export default function Header({ username, current, locked, onNavigate, onLogout }) {
  const tab = (name, label) => (
    <button
      className={`tab ${current === name || (name === 'exams' && current === 'result') ? 'active' : ''}`}
      disabled={locked}
      onClick={() => onNavigate(name)}
    >
      {label}
    </button>
  );

  return (
    <header className="header">
      <div className="header-inner">
        <strong className="brand">Simulador de exámenes</strong>
        <nav>
          {tab('exams', 'Exámenes')}
          {tab('stats', 'Mis estadísticas')}
        </nav>
        <div className="user">
          <span>{username}</span>
          <button className="link" disabled={locked} onClick={onLogout}>Cambiar</button>
        </div>
      </div>
    </header>
  );
}
