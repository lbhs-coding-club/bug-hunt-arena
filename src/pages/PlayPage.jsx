import { CheckCircle2, LogOut, Play, RotateCcw, Send, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { challenges, getSpeedBonus, totalPossiblePoints } from '../data/challenges.js';
import {
  createPlayer,
  FIREBASE_SETUP_MESSAGE,
  getPlayer,
  PLAYER_ID_STORAGE_KEY,
  updatePlayer
} from '../services/leaderboardService.js';
import { firebaseStatus } from '../services/firebase.js';
import { checkChallengeAnswer } from '../utils/answerCheck.js';
import { formatDuration, getCompletedCount, getCompletedIds } from '../utils/format.js';

let audioContext = null;

function ensureAudio() {
  if (typeof window === 'undefined') return null;
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioConstructor) return null;
  if (!audioContext) audioContext = new AudioConstructor();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(freq = 440, duration = 0.12, type = 'sine', volume = 0.24) {
  try {
    const context = ensureAudio();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = 0.0001;
    oscillator.connect(gain);
    gain.connect(context.destination);
    const now = context.currentTime;
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.01);
    oscillator.start(now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    window.setTimeout(() => {
      try {
        oscillator.stop();
      } catch {
        // The tone may already be stopped if the browser cleans it up first.
      }
    }, (duration + 0.05) * 1000);
  } catch {
    // Sound is a bonus; gameplay should never fail if audio is blocked.
  }
}

function playSuccessSound() {
  playTone(520, 0.12, 'sine', 0.22);
  window.setTimeout(() => playTone(660, 0.12, 'sine', 0.22), 90);
  window.setTimeout(() => playTone(880, 0.14, 'sine', 0.22), 180);
}

function playFailSound() {
  playTone(160, 0.18, 'sawtooth', 0.24);
  window.setTimeout(() => playTone(120, 0.12, 'sawtooth', 0.18), 120);
}

function InlineFeedback({ feedback }) {
  if (!feedback) return null;

  return (
    <div className={`inline-message ${feedback.type}`} role="status">
      <strong>{feedback.title}</strong>
      <span>{feedback.body}</span>
    </div>
  );
}

function CinemaFeedback({ cinema }) {
  if (!cinema) return null;

  return (
    <div className={`cinema-popup ${cinema.visible ? 'show' : ''}`} role="status" aria-live="polite">
      <div className={`cinema-content ${cinema.type === 'success' ? 'success' : 'fail'}`}>
        {cinema.text}
      </div>
    </div>
  );
}

const CODE_TOKEN_PATTERNS = [
  { className: 'token-comment', regex: /^(?:<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*)/ },
  { className: 'token-string', regex: /^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/ },
  { className: 'token-tag', regex: /^<\/?[A-Za-z][A-Za-z0-9-]*/ },
  { className: 'token-attr', regex: /^[A-Za-z_:][-A-Za-z0-9_:.]*(?=\s*=)/ },
  { className: 'token-selector', regex: /^[#.][A-Za-z_][\w-]*/ },
  { className: 'token-property', regex: /^[a-z-]+(?=\s*:)/ },
  { className: 'token-keyword', regex: /^\b(?:const|let|var|if|else|for|while|function|return|true|false|null|new|document|console|querySelector|addEventListener|createElement|appendChild|textContent|length|log)\b/ },
  { className: 'token-number', regex: /^\b\d+(?:\.\d+)?\b/ },
  { className: 'token-operator', regex: /^[{}\[\]();,.=<>!+\-*\/:]+/ }
];

function highlightCodeTokens(code) {
  const tokens = [];
  let index = 0;

  while (index < code.length) {
    const chunk = code.slice(index);
    const match = CODE_TOKEN_PATTERNS.map((pattern) => ({
      ...pattern,
      match: chunk.match(pattern.regex)
    })).find((pattern) => pattern.match);

    if (match) {
      const text = match.match[0];
      tokens.push({ text, className: match.className });
      index += text.length;
    } else {
      tokens.push({ text: code[index], className: '' });
      index += 1;
    }
  }

  return tokens.map((token, tokenIndex) =>
    token.className ? (
      <span className={token.className} key={`${token.className}-${tokenIndex}`}>
        {token.text}
      </span>
    ) : (
      token.text
    )
  );
}

function CodeEditor({ disabled, language, onChange, value }) {
  const highlightRef = useRef(null);
  const textareaRef = useRef(null);

  function syncHighlightScroll(event) {
    if (!highlightRef.current) return;
    highlightRef.current.scrollTop = event.currentTarget.scrollTop;
    highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
  }

  function handleKeyDown(event) {
    if (event.key !== 'Tab' || disabled) return;

    event.preventDefault();
    const textarea = event.currentTarget;
    const before = value.slice(0, textarea.selectionStart);
    const after = value.slice(textarea.selectionEnd);
    const nextValue = `${before}  ${after}`;
    const nextCursor = before.length + 2;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.selectionStart = nextCursor;
      textareaRef.current.selectionEnd = nextCursor;
    });
  }

  return (
    <div className="highlight-editor-shell" data-language={language}>
      <pre className="highlighted-code" aria-hidden="true" ref={highlightRef}>
        <code>{highlightCodeTokens(value)}</code>
      </pre>
      <textarea
        id="codeDraft"
        className="code-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncHighlightScroll}
        spellCheck="false"
        disabled={disabled}
        rows={14}
        wrap="off"
        ref={textareaRef}
      />
    </div>
  );
}

export default function PlayPage() {
  const [displayName, setDisplayName] = useState('');
  const [player, setPlayer] = useState(null);
  const [codeDraft, setCodeDraft] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [terminalState, setTerminalState] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const setupRequired = firebaseStatus.requiresSetup;

  useEffect(() => {
    document.title = 'Play | LBHS Coding Club: Bug Hunt Arena';

    async function loadSavedPlayer() {
      if (setupRequired) {
        window.localStorage.removeItem(PLAYER_ID_STORAGE_KEY);
        setLoading(false);
        return;
      }

      const savedId = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
      if (!savedId) {
        setLoading(false);
        return;
      }

      try {
        const savedPlayer = await getPlayer(savedId);
        if (savedPlayer) {
          setPlayer(savedPlayer);
          setDisplayName(savedPlayer.displayName);
        } else {
          window.localStorage.removeItem(PLAYER_ID_STORAGE_KEY);
        }
      } catch {
        window.localStorage.removeItem(PLAYER_ID_STORAGE_KEY);
        setFeedback({
          type: 'error',
          title: 'Leaderboard unavailable',
          body: FIREBASE_SETUP_MESSAGE
        });
      }
      setLoading(false);
    }

    loadSavedPlayer();
  }, [setupRequired]);

  const completedCount = getCompletedCount(player);
  const isFinished = player?.completed || completedCount >= challenges.length;
  const currentIndex = Math.min(completedCount, challenges.length - 1);
  const currentChallenge = challenges[currentIndex];
  const progressPercent = Math.round((completedCount / challenges.length) * 100);

  const scoreGoal = useMemo(() => totalPossiblePoints + 75, []);

  useEffect(() => {
    if (currentChallenge && !isFinished) {
      setCodeDraft(currentChallenge.brokenCode);
      setTerminalState('');
    }
  }, [currentChallenge?.id, isFinished]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(() => setFeedback(null), feedback.type === 'error' ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function showCinemaPopup(type, text, ms = 1000) {
    return new Promise((resolve) => {
      const terminalEffect = type === 'success' ? 'success-glow' : 'fail-glitch';
      setCinema({ type, text, visible: false });
      setTerminalState(terminalEffect);

      if (type === 'success') playSuccessSound();
      else playFailSound();

      window.requestAnimationFrame(() => {
        setCinema({ type, text, visible: true });
      });

      window.setTimeout(() => {
        setCinema((current) => (current?.text === text ? { ...current, visible: false } : current));
        setTerminalState('');
        window.setTimeout(() => {
          setCinema(null);
          resolve();
        }, 240);
      }, ms);
    });
  }

  async function handleStart(event) {
    event.preventDefault();
    ensureAudio();

    if (setupRequired) {
      setFeedback({
        type: 'error',
        title: 'Firebase setup required',
        body: FIREBASE_SETUP_MESSAGE
      });
      return;
    }

    const cleanName = displayName.trim().replace(/\s+/g, ' ');

    if (cleanName.length < 2) {
      setSubmitting(true);
      setFeedback({
        type: 'error',
        title: 'Pick a leaderboard name',
        body: 'Use one name or two partner names, like Alex or Alex + Brooke.'
      });
      await showCinemaPopup('fail', 'ACCESS DENIED', 1000);
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      const nextPlayer = await createPlayer(cleanName);
      window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, nextPlayer.id);
      setFeedback({
        type: 'success',
        title: 'Arena ready',
        body: 'Start with Level 1 and hunt one bug at a time.'
      });
      await showCinemaPopup('success', 'ARENA READY', 1000);
      setPlayer(nextPlayer);
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Could not join yet',
        body: error.message || 'Check the Firebase settings and try again.'
      });
      await showCinemaPopup('fail', 'ACCESS DENIED', 1000);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    ensureAudio();
    if (submitting || !player || !currentChallenge || isFinished) return;

    setSubmitting(true);
    const result = checkChallengeAnswer(codeDraft, currentChallenge);
    if (!result.correct) {
      setFeedback({
        type: 'error',
        title: 'Still buggy',
        body: `${result.message} Keep editing the code, then check it again.`
      });
      await showCinemaPopup('fail', 'ACCESS DENIED', 1000);
      setSubmitting(false);
      return;
    }

    const completedChallengeIds = {
      ...getCompletedIds(player),
      [currentChallenge.id]: true
    };
    const nextCompletedCount = Object.keys(completedChallengeIds).length;
    const finishedNow = nextCompletedCount >= challenges.length;
    const completionSeconds = finishedNow
      ? Math.max(1, Math.round((Date.now() - player.startedAtMs) / 1000))
      : null;
    const speedBonus = finishedNow ? getSpeedBonus(completionSeconds) : player.speedBonus || 0;
    const bonusEarned = finishedNow ? speedBonus : 0;
    const nextScore = (player.score || 0) + currentChallenge.points + bonusEarned;
    const nextPlayer = {
      ...player,
      score: nextScore,
      currentLevel: finishedNow ? challenges.length : nextCompletedCount + 1,
      completed: finishedNow,
      completedChallengeIds,
      completionSeconds,
      speedBonus,
      updatedAtMs: Date.now()
    };

    try {
      await updatePlayer(player.id, {
        displayName: player.displayName,
        startedAtMs: player.startedAtMs,
        demo: false,
        score: nextScore,
        currentLevel: nextPlayer.currentLevel,
        completed: finishedNow,
        completedChallengeIds,
        completionSeconds,
        speedBonus
      });

      setShowHint(false);
      setFeedback({
        type: 'success',
        title: finishedNow ? 'Arena cleared' : 'Bug cleared',
        body: finishedNow
          ? `${result.message} Final score: ${nextScore}. Completion time: ${formatDuration(
              completionSeconds
            )}.`
          : `${result.message} +${currentChallenge.points} points. Next level unlocked.`
      });
      await showCinemaPopup('success', finishedNow ? 'ARENA CLEARED' : 'BUG CLEARED', 1000);
      setPlayer(nextPlayer);
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Score did not save',
        body: error.message || 'Check the Firebase connection and submit again.'
      });
      await showCinemaPopup('fail', 'ACCESS DENIED', 1000);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewRun() {
    window.localStorage.removeItem(PLAYER_ID_STORAGE_KEY);
    setPlayer(null);
    setCodeDraft('');
    setFeedback(null);
    setTerminalState('');
    setShowHint(false);
  }

  function handleResetCode() {
    setCodeDraft(currentChallenge.brokenCode);
    setFeedback({
      type: 'weak',
      title: 'Starter code restored',
      body: 'The original bug is back in the editor.'
    });
  }

  if (loading) {
    return (
      <section className="page narrow-page">
        <div className="panel center-panel">
          <div className="spinner" aria-label="Loading"></div>
          <p>Loading the LBHS Coding Club arena...</p>
        </div>
      </section>
    );
  }

  if (!player) {
    return (
      <section className="page narrow-page play-landing">
        <div className="start-shell terminal">
          <img src="./lbhs-bug-hunt-badge.svg" alt="LBHS Coding Club Bug Hunt Arena badge" />
          <p className="eyebrow">Los Banos High School Coding Club</p>
          <h1>LBHS Coding Club: Bug Hunt Arena</h1>
          <p className="lead">
            Enter one leaderboard name, fix the broken code, and climb the live scoreboard.
          </p>

          <div className="start-rules" aria-label="Activity overview">
            <span>Solo or partner pair</span>
            <span>One leaderboard name</span>
            <span>Edit code directly</span>
            <span>8 debugging levels</span>
          </div>

          <form className="start-form" onSubmit={handleStart}>
            <label htmlFor="displayName">Leaderboard name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Alex or Alex + Brooke"
              maxLength={40}
              autoComplete="off"
              disabled={submitting || setupRequired}
            />
            <button className="button primary full-width" disabled={submitting || setupRequired}>
              <Play size={18} aria-hidden="true" />
              {setupRequired ? 'Firebase Setup Required' : 'Start Bug Hunt'}
            </button>
            <p className="small-note">
              {setupRequired
                ? 'Add Firebase environment variables and rebuild before students join.'
                : 'Example: Alex or Alex + Brooke. No accounts or logins.'}
            </p>
            {setupRequired && (
              <InlineFeedback
                feedback={{
                  type: 'error',
                  title: 'Production setup needed',
                  body: FIREBASE_SETUP_MESSAGE
                }}
              />
            )}
            <InlineFeedback feedback={feedback} />
          </form>
        </div>

        <CinemaFeedback cinema={cinema} />
      </section>
    );
  }

  return (
    <section className="page play-page straightforward-page">
      <div className="simple-player-bar">
        <span>{player.displayName}</span>
        <div>
          <button className="button secondary" type="button" onClick={handleNewRun}>
            <LogOut size={17} aria-hidden="true" />
            New Run
          </button>
        </div>
      </div>

      {isFinished ? (
        <div className="panel terminal finish-panel">
          <CheckCircle2 size={44} aria-hidden="true" />
          <p className="eyebrow">Bug Hunt Arena complete</p>
          <h2>Nice debugging, {player.displayName}.</h2>
          <p>
            Final score: <strong>{player.score}</strong>. Completion time:{' '}
            <strong>{formatDuration(player.completionSeconds)}</strong>.
          </p>
          <p className="small-note">
            Keep the leaderboard open at the front of the room to see where everyone lands.
          </p>
        </div>
      ) : (
        <div className={`level-shell terminal ${terminalState}`}>
          <header className="level-header">
            <p className="eyebrow">LBHS Coding Club Bug Hunt Arena</p>
            <h1>
              Level {currentChallenge.level}: {currentChallenge.title}
            </h1>
            <div className="challenge-meta">
              <span>
                {completedCount}/{challenges.length} complete
              </span>
              <span>{currentChallenge.difficulty}</span>
              <span>{currentChallenge.points} points</span>
              <span>Score {player.score || 0}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </header>

          <section className="bug-report">
            <div>
              <strong>Bug report</strong>
              <p>{currentChallenge.story}</p>
            </div>
            <div>
              <strong>Your job</strong>
              <p>{currentChallenge.goal}</p>
            </div>
          </section>

          <form className="answer-panel direct-editor" onSubmit={handleSubmit}>
            <div className="editor-heading">
              <div>
                <p className="eyebrow">Edit this code</p>
                <h2>Make the code correct</h2>
              </div>
              <span>{currentChallenge.language}</span>
            </div>
            <div className="answer-actions">
              <button className="button primary" disabled={submitting}>
                <Send size={17} aria-hidden="true" />
                Check My Fix
              </button>
              <button className="button secondary" type="button" onClick={handleResetCode} disabled={submitting}>
                <RotateCcw size={17} aria-hidden="true" />
                Reset Code
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setShowHint((value) => !value)}
                disabled={submitting}
              >
                <Sparkles size={17} aria-hidden="true" />
                Hint
              </button>
            </div>
            <label htmlFor="codeDraft">Code to fix</label>
            <CodeEditor
              value={codeDraft}
              onChange={setCodeDraft}
              disabled={submitting}
              language={currentChallenge.language}
            />
            {showHint && <p className="hint-box">{currentChallenge.hint}</p>}
            <InlineFeedback feedback={feedback} />
          </form>
        </div>
      )}

      <CinemaFeedback cinema={cinema} />
    </section>
  );
}
