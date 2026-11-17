import { formatTime } from '../api.js';

export default function Timer({ secondsLeft }) {
  const urgent = secondsLeft <= 60;
  return (
    <div className={`timer ${urgent ? 'urgent' : ''}`} role="timer" aria-live="off">
      {formatTime(secondsLeft)}
    </div>
  );
}
