import {
  get,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update
} from 'firebase/database';
import { demoPlayers } from '../data/demoPlayers.js';
import { database, firebaseStatus } from './firebase.js';

export const PLAYER_ID_STORAGE_KEY = 'lbhsBugHuntPlayerId';
export const FIREBASE_SETUP_MESSAGE =
  'Firebase is not configured for this production build. Add the VITE_FIREBASE_* values and rebuild before students join.';
const DEMO_DISABLED_MESSAGE =
  'Demo tools are disabled for this production build. Set VITE_ENABLE_DEMO_MODE=true only for local testing.';

const LOCAL_PLAYERS_KEY = 'lbhsBugHuntPlayers';
const localListeners = new Set();

function hasWindow() {
  return typeof window !== 'undefined';
}

function nowMs() {
  return Date.now();
}

function normalizePlayer(id, value = {}) {
  return {
    id,
    displayName: value.displayName || 'Unnamed player',
    score: Number(value.score || 0),
    currentLevel: Number(value.currentLevel || 1),
    completed: Boolean(value.completed),
    completionSeconds: Number.isFinite(Number(value.completionSeconds))
      ? Number(value.completionSeconds)
      : null,
    speedBonus: Number(value.speedBonus || 0),
    completedChallengeIds: value.completedChallengeIds || {},
    demo: Boolean(value.demo),
    startedAtMs: Number(value.startedAtMs || value.startedAt || nowMs()),
    updatedAtMs: Number(value.updatedAtMs || value.updatedAt || nowMs())
  };
}

function sanitizeDisplayName(name) {
  return String(name || '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
}

function readLocalPlayersObject() {
  if (!hasWindow()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_PLAYERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalPlayersObject(players) {
  if (!hasWindow()) return;
  window.localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(players));
  localListeners.forEach((listener) => listener());
}

function getLocalPlayers() {
  const data = readLocalPlayersObject();
  return Object.entries(data).map(([id, player]) => normalizePlayer(id, player));
}

function makeLocalId() {
  if (hasWindow() && window.crypto?.randomUUID) {
    return `local-${window.crypto.randomUUID()}`;
  }
  return `local-${Math.random().toString(36).slice(2)}`;
}

function canUseLocalDemoStorage() {
  return firebaseStatus.allowLocalDemoMode;
}

function ensureStorageReady() {
  if (!database && !canUseLocalDemoStorage()) {
    throw new Error(FIREBASE_SETUP_MESSAGE);
  }
}

function ensureDemoToolsEnabled() {
  if (!firebaseStatus.demoModeEnabled) {
    throw new Error(DEMO_DISABLED_MESSAGE);
  }
}

if (hasWindow()) {
  window.addEventListener('storage', (event) => {
    if (event.key === LOCAL_PLAYERS_KEY) {
      localListeners.forEach((listener) => listener());
    }
  });
}

export function subscribeToPlayers(callback, onError) {
  if (database) {
    return onValue(
      ref(database, 'players'),
      (snapshot) => {
        const data = snapshot.val() || {};
        callback(Object.entries(data).map(([id, value]) => normalizePlayer(id, value)));
      },
      (error) => {
        onError?.(error);
      }
    );
  }

  if (!canUseLocalDemoStorage()) {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      callback([]);
      onError?.(new Error(FIREBASE_SETUP_MESSAGE));
    });
    return () => {
      active = false;
    };
  }

  const listener = () => callback(getLocalPlayers());
  localListeners.add(listener);
  listener();
  return () => localListeners.delete(listener);
}

export async function getPlayer(playerId) {
  if (!playerId) return null;

  if (database) {
    const snapshot = await get(ref(database, `players/${playerId}`));
    return snapshot.exists() ? normalizePlayer(playerId, snapshot.val()) : null;
  }

  if (!canUseLocalDemoStorage()) {
    return null;
  }

  const players = readLocalPlayersObject();
  return players[playerId] ? normalizePlayer(playerId, players[playerId]) : null;
}

export async function createPlayer(displayName) {
  const cleanName = sanitizeDisplayName(displayName);
  if (cleanName.length < 2) {
    throw new Error('Display name must be at least 2 characters.');
  }
  ensureStorageReady();

  const basePlayer = {
    displayName: cleanName,
    score: 0,
    currentLevel: 1,
    completed: false,
    completedChallengeIds: {},
    completionSeconds: null,
    speedBonus: 0,
    demo: false,
    startedAtMs: nowMs(),
    updatedAtMs: nowMs()
  };

  if (database) {
    const playerRef = push(ref(database, 'players'));
    await set(playerRef, {
      ...basePlayer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return normalizePlayer(playerRef.key, basePlayer);
  }

  const id = makeLocalId();
  const players = readLocalPlayersObject();
  players[id] = basePlayer;
  writeLocalPlayersObject(players);
  return normalizePlayer(id, basePlayer);
}

export async function updatePlayer(playerId, updates) {
  ensureStorageReady();

  const payload = {
    ...updates,
    updatedAtMs: nowMs()
  };

  if (database) {
    await update(ref(database, `players/${playerId}`), {
      ...payload,
      updatedAt: serverTimestamp()
    });
    return;
  }

  const players = readLocalPlayersObject();
  players[playerId] = {
    ...(players[playerId] || {}),
    ...payload
  };
  writeLocalPlayersObject(players);
}

export async function resetLeaderboard() {
  ensureStorageReady();

  if (database) {
    await remove(ref(database, 'players'));
    return;
  }

  writeLocalPlayersObject({});
}

export async function clearDemoPlayers() {
  ensureStorageReady();
  ensureDemoToolsEnabled();

  if (database) {
    const snapshot = await get(ref(database, 'players'));
    const data = snapshot.val() || {};
    await Promise.all(
      Object.entries(data)
        .filter(([, value]) => value?.demo)
        .map(([id]) => remove(ref(database, `players/${id}`)))
    );
    return;
  }

  const players = readLocalPlayersObject();
  Object.entries(players).forEach(([id, player]) => {
    if (player.demo) delete players[id];
  });
  writeLocalPlayersObject(players);
}

export async function addDemoPlayers() {
  ensureStorageReady();
  ensureDemoToolsEnabled();

  const timestamp = nowMs();

  if (database) {
    await Promise.all(
      demoPlayers.map((player) =>
        set(ref(database, `players/${player.id}`), {
          ...player,
          updatedAtMs: timestamp,
          updatedAt: serverTimestamp()
        })
      )
    );
    return;
  }

  const players = readLocalPlayersObject();
  demoPlayers.forEach((player) => {
    players[player.id] = {
      ...player,
      updatedAtMs: timestamp
    };
  });
  writeLocalPlayersObject(players);
}
