export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Not finished';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function getCompletedIds(player) {
  return player?.completedChallengeIds || {};
}

export function getCompletedCount(player) {
  return Object.keys(getCompletedIds(player)).length;
}

export function getLevelLabel(player, totalLevels) {
  if (player?.completed) return 'Complete';
  const level = Number(player?.currentLevel || 1);
  return `Level ${Math.min(level, totalLevels)}/${totalLevels}`;
}

export function rankPlayers(players, totalLevels) {
  return [...players]
    .filter((player) => player.displayName)
    .sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      if (a.completed && b.completed) {
        return (a.completionSeconds || Infinity) - (b.completionSeconds || Infinity);
      }
      if (a.completed !== b.completed) return a.completed ? -1 : 1;
      return (b.currentLevel || 1) - (a.currentLevel || 1);
    })
    .map((player, index) => ({
      ...player,
      rank: index + 1,
      levelLabel: getLevelLabel(player, totalLevels)
    }));
}
