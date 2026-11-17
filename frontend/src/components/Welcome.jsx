import { useState } from 'react';

export default function Welcome({ onLogin }) {
  const [name, setName] = useState('');
  const valid = name.trim().length >= 2;

  const submit = (e) => {
    e.preventDefault();
    if (valid) onLogin(name.trim());
  };

  return (
    <div className="welcome">
      <div className="welcome-card">
        <h1>Simulador de exámenes</h1>
        <p>Practica con exámenes cronometrados y revisa tu progreso en cada intento.</p>
        <form onSubmit={submit}>
          <label htmlFor="username">Tu nombre</label>
          <input
            id="username"
            value={name}
            maxLength={30}
            autoFocus
            placeholder="Por ejemplo: Laura"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary" disabled={!valid}>Entrar</button>
        </form>
      </div>
    </div>
  );
}
