import { useEffect, useState } from 'react';
import { subscribeToPlayers } from '../services/leaderboardService.js';

export function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToPlayers(
      (nextPlayers) => {
        setPlayers(nextPlayers);
        setLoading(false);
        setError(null);
      },
      (nextError) => {
        setLoading(false);
        setError(nextError.message || 'Could not load leaderboard data.');
      }
    );

    return unsubscribe;
  }, []);

  return { players, loading, error };
}
