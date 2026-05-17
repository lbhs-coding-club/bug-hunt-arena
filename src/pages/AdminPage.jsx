import { DatabaseZap, Eraser, KeyRound, PlusCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { challenges } from '../data/challenges.js';
import { usePlayers } from '../hooks/usePlayers.js';
import {
  addDemoPlayers,
  clearDemoPlayers,
  FIREBASE_SETUP_MESSAGE,
  resetLeaderboard
} from '../services/leaderboardService.js';
import { firebaseStatus } from '../services/firebase.js';
import { formatDuration, rankPlayers } from '../utils/format.js';

const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '';

export default function AdminPage() {
  const { players, loading, error } = usePlayers();
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(
    () => window.sessionStorage.getItem('lbhsBugHuntAdminUnlocked') === 'true'
  );
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Admin | LBHS Coding Club: Bug Hunt Arena';
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(null), message.type === 'error' ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [message]);

  function dismissMessageWithKeyboard(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setMessage(null);
    }
  }

  const rankedPlayers = useMemo(() => rankPlayers(players, challenges.length), [players]);
  const demoCount = players.filter((player) => player.demo).length;
  const allowDemoTools = firebaseStatus.demoModeEnabled;
  const setupRequired = firebaseStatus.requiresSetup;

  function handleLogin(event) {
    event.preventDefault();

    if (!adminPassword) {
      setMessage({
        type: 'error',
        text: 'Set VITE_ADMIN_PASSWORD in .env.local before using admin actions.'
      });
      return;
    }

    if (password === adminPassword) {
      window.sessionStorage.setItem('lbhsBugHuntAdminUnlocked', 'true');
      setUnlocked(true);
      setPassword('');
      setMessage({ type: 'success', text: 'Admin tools unlocked for this browser tab.' });
    } else {
      setMessage({ type: 'error', text: 'That password did not match the classroom admin password.' });
    }
  }

  async function runAdminAction(action, successMessage) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ type: 'success', text: successMessage });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'The admin action failed.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset the full LBHS Coding Club leaderboard? This removes all players.')) {
      return;
    }

    await runAdminAction(resetLeaderboard, 'Leaderboard reset. Students can start fresh.');
  }

  async function handleClearDemo() {
    await runAdminAction(clearDemoPlayers, 'Demo players cleared.');
  }

  async function handleAddDemo() {
    await runAdminAction(addDemoPlayers, 'Demo players added for projector testing.');
  }

  return (
    <section className="page admin-page">
      <div className="admin-hero">
        <div>
          <p className="eyebrow">LBHS Coding Club admin</p>
          <h1>Bug Hunt Arena Control Desk</h1>
          <p>
            Reset scores and check the live classroom leaderboard before the meeting starts.
          </p>
        </div>
      </div>

      {!unlocked ? (
        <form className="panel login-panel" onSubmit={handleLogin}>
          <KeyRound size={36} aria-hidden="true" />
          <h2>Enter classroom admin password</h2>
          <p>
            This is basic protection for a static GitHub Pages app. It keeps the reset controls off
            student screens, but it is not high-security authentication.
          </p>
          <label htmlFor="adminPassword">Admin password</label>
          <input
            id="adminPassword"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="VITE_ADMIN_PASSWORD"
          />
          <button className="button primary">
            <ShieldCheck size={18} aria-hidden="true" />
            Unlock Admin
          </button>
        </form>
      ) : (
        <>
          {setupRequired && (
            <div className="inline-alert error" role="alert">
              {FIREBASE_SETUP_MESSAGE}
            </div>
          )}

          <div className={`admin-actions ${allowDemoTools ? '' : 'single-action'}`}>
            {allowDemoTools && (
              <>
                <button className="action-card" onClick={handleAddDemo} disabled={busy || setupRequired}>
                  <PlusCircle size={26} aria-hidden="true" />
                  <span>Add demo players</span>
                  <small>Load sample LBHS Coding Club scores for projector testing.</small>
                </button>
                <button
                  className="action-card"
                  onClick={handleClearDemo}
                  disabled={busy || setupRequired || demoCount === 0}
                >
                  <Eraser size={26} aria-hidden="true" />
                  <span>Clear demo data</span>
                  <small>Remove only sample players and keep real student scores.</small>
                </button>
              </>
            )}
            <button className="action-card danger" onClick={handleReset} disabled={busy || setupRequired}>
              <RotateCcw size={26} aria-hidden="true" />
              <span>Reset leaderboard</span>
              <small>Remove all live players before a new meeting run.</small>
            </button>
          </div>

          <div className={`admin-summary ${allowDemoTools ? '' : 'two-up'}`}>
            <div>
              <DatabaseZap size={26} aria-hidden="true" />
              <span>Total players</span>
              <strong>{loading ? 'Loading' : players.length}</strong>
            </div>
            {allowDemoTools && (
              <div>
                <span>Demo players</span>
                <strong>{demoCount}</strong>
              </div>
            )}
            <div>
              <span>Completed</span>
              <strong>{players.filter((player) => player.completed).length}</strong>
            </div>
          </div>

          <div className="admin-table-wrap">
            {error && (
              <div className="inline-alert error" role="alert">
                Leaderboard connection issue: {error}
              </div>
            )}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>LBHS Coding Club Player</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Finish Time</th>
                </tr>
              </thead>
              <tbody>
                {rankedPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>#{player.rank}</td>
                    <td>
                      {player.displayName}
                      {player.demo && <span className="demo-tag">Demo</span>}
                    </td>
                    <td>{player.score}</td>
                    <td>{player.levelLabel}</td>
                    <td>{player.completed ? 'Complete' : 'In progress'}</td>
                    <td>{player.completed ? formatDuration(player.completionSeconds) : 'Not finished'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && rankedPlayers.length === 0 && (
              <div className="empty-state compact">
                <h2>{setupRequired ? 'Firebase setup required' : 'No players to show'}</h2>
                <p>
                  {setupRequired
                    ? 'Add Firebase environment variables and rebuild before using the live admin desk.'
                    : 'Have students join from /#/play when the activity starts.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {message && (
        <div
          className={`feedback ${message.type}`}
          role="status"
          tabIndex="0"
          title="Click to dismiss"
          onClick={() => setMessage(null)}
          onKeyDown={dismissMessageWithKeyboard}
        >
          <strong>{message.type === 'success' ? 'Done' : 'Heads up'}</strong>
          <span>{message.text}</span>
        </div>
      )}
    </section>
  );
}
