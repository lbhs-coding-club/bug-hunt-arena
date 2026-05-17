import { Flag, Monitor, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { challenges } from '../data/challenges.js';
import { demoPlayers } from '../data/demoPlayers.js';
import { usePlayers } from '../hooks/usePlayers.js';
import { firebaseStatus } from '../services/firebase.js';
import { formatDuration, rankPlayers } from '../utils/format.js';

export default function LeaderboardPage() {
  const { players, loading, error } = usePlayers();
  const [demoView, setDemoView] = useState(false);
  const allowDemoView = firebaseStatus.demoModeEnabled;
  const setupRequired = firebaseStatus.requiresSetup;

  useEffect(() => {
    document.title = 'Leaderboard | LBHS Coding Club: Bug Hunt Arena';
  }, []);

  const rankedPlayers = useMemo(() => {
    const source = allowDemoView && demoView ? demoPlayers : players;
    return rankPlayers(source, challenges.length);
  }, [allowDemoView, demoView, players]);

  const leader = rankedPlayers[0];

  return (
    <section className="page leaderboard-page">
      <div className="leaderboard-hero">
        <div>
          <p className="eyebrow">LBHS Coding Club live scoreboard</p>
          <h1>Bug Hunt Arena Leaderboard</h1>
          <p>
            Projector-ready rankings for the Los Banos High School Coding Club debugging challenge.
          </p>
        </div>
        {allowDemoView && (
          <div className="leaderboard-controls">
            <label className="switch-control">
              <input
                type="checkbox"
                checked={demoView}
                onChange={(event) => setDemoView(event.target.checked)}
              />
              <span>Demo projector view</span>
            </label>
          </div>
        )}
      </div>

      <div className="leader-strip">
        <div className="leader-card">
          <Trophy size={32} aria-hidden="true" />
          <span>Current leader</span>
          <strong>{leader ? leader.displayName : 'Waiting for players'}</strong>
        </div>
        <div className="leader-card">
          <Monitor size={32} aria-hidden="true" />
          <span>Players shown</span>
          <strong>{loading ? 'Loading' : rankedPlayers.length}</strong>
        </div>
        <div className="leader-card">
          <Flag size={32} aria-hidden="true" />
          <span>Total levels</span>
          <strong>{challenges.length}</strong>
        </div>
      </div>

      <div className="leaderboard-table-wrap">
        {setupRequired && (
          <div className="inline-alert error" role="alert">
            Firebase is required for the production leaderboard. Add the VITE_FIREBASE_* values
            and rebuild before the meeting.
          </div>
        )}
        {error && (
          <div className="inline-alert error" role="alert">
            Leaderboard connection issue: {error}
          </div>
        )}
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>LBHS Coding Club Player</th>
              <th>Score</th>
              <th>Current Level</th>
              <th>Status</th>
              <th>Finish Time</th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.map((player) => (
              <tr key={player.id} className={player.completed ? 'complete-row' : ''}>
                <td className="rank-cell">#{player.rank}</td>
                <td>
                  <strong>{player.displayName}</strong>
                  {player.demo && <span className="demo-tag">Demo</span>}
                </td>
                <td className="score-cell">{player.score}</td>
                <td>{player.levelLabel}</td>
                <td>{player.completed ? 'Complete' : 'In progress'}</td>
                <td>{player.completed ? formatDuration(player.completionSeconds) : 'Not finished'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && rankedPlayers.length === 0 && (
          <div className="empty-state">
            <h2>{setupRequired ? 'Firebase setup required' : 'No players yet'}</h2>
            <p>
              {setupRequired
                ? 'This production build needs Firebase before live scores can appear.'
                : 'Open /#/play on student devices when the activity starts.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
