import { useState } from 'react';
import Header from './components/Header.jsx';
import Welcome from './components/Welcome.jsx';
import ExamList from './components/ExamList.jsx';
import ExamRunner from './components/ExamRunner.jsx';
import ResultView from './components/ResultView.jsx';
import StatsDashboard from './components/StatsDashboard.jsx';

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [view, setView] = useState({ name: 'exams' });

  const login = (name) => {
    localStorage.setItem('username', name);
    setUsername(name);
  };
  const logout = () => {
    localStorage.removeItem('username');
    setUsername('');
    setView({ name: 'exams' });
  };

  if (!username) return <Welcome onLogin={login} />;

  const inExam = view.name === 'exam';

  return (
    <>
      <Header
        username={username}
        current={view.name}
        locked={inExam}
        onNavigate={(name) => setView({ name })}
        onLogout={logout}
      />
      <main className="container">
        {view.name === 'exams' && <ExamList onStart={(examId) => setView({ name: 'exam', examId })} />}
        {view.name === 'exam' && (
          <ExamRunner
            examId={view.examId}
            username={username}
            onFinish={(result, examTitle) => setView({ name: 'result', result, examTitle })}
            onCancel={() => setView({ name: 'exams' })}
          />
        )}
        {view.name === 'result' && (
          <ResultView
            result={view.result}
            examTitle={view.examTitle}
            onRetry={() => setView({ name: 'exams' })}
            onStats={() => setView({ name: 'stats' })}
          />
        )}
        {view.name === 'stats' && <StatsDashboard username={username} />}
      </main>
    </>
  );
}
