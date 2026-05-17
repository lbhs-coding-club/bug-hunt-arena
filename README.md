# LBHS Coding Club: Bug Hunt Arena

LBHS Coding Club: Bug Hunt Arena is a static React/Vite web app for a 45-minute beginner-friendly Los Banos High School Coding Club activity. Students play solo or with one partner, enter one display name, debug 8 small beginner challenges, earn points, and appear on a live Firebase Realtime Database leaderboard.

The app is designed for GitHub Pages. It does not use student accounts, a custom backend server, API routes, Next.js server functions, or backend-only code.

## Routes

- Student play page: `/#/play`
- Projector leaderboard: `/#/leaderboard`
- Classroom admin page: `/#/admin`

The app uses `HashRouter`, so GitHub Pages refreshes and direct links work.

## Run Locally

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local Vite URL, then go to:

- `http://localhost:5173/#/play`
- `http://localhost:5173/#/leaderboard`
- `http://localhost:5173/#/admin`

Build for production:

```bash
npm test
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run all production checks:

```bash
npm run check
```

## Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a Firebase project for the activity.
3. Add a Web App inside the Firebase project.
4. Create a Realtime Database.
5. Start in a test or classroom-friendly mode, then paste the classroom rules below.
6. Copy your Web App config values into `.env.local`.

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ENABLE_DEMO_MODE=false
VITE_ADMIN_PASSWORD=...
```

All Firebase variables use `VITE_` because Vite exposes them to the static frontend at build time.

Firebase is required for production play and live leaderboard sync. If these values are missing and `VITE_ENABLE_DEMO_MODE` is not set to `true`, the app shows a setup-required message and does not create local-only leaderboard entries.

## Recommended Realtime Database Rules

These rules are meant for a short classroom activity where students do not log in. They allow the app to read and write leaderboard entries under `/players`, while blocking unrelated root paths.

```json
{
  "rules": {
    "players": {
      ".read": true,
      ".write": true,
      "$playerId": {
        ".validate": "newData.hasChildren(['displayName', 'score', 'currentLevel', 'completed']) && newData.child('displayName').isString() && newData.child('displayName').val().length <= 40 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 2000 && newData.child('currentLevel').isNumber() && newData.child('currentLevel').val() >= 1 && newData.child('currentLevel').val() <= 8 && newData.child('completed').isBoolean()"
      }
    },
    ".read": false,
    ".write": false
  }
}
```

Important: because this is a no-login static app, these rules are not strong user-level security. For best classroom reliability, use a dedicated Firebase project or database for this activity, reset it before the meeting, and lock it down after the meeting.

## Admin Password Note

`/#/admin` uses `VITE_ADMIN_PASSWORD` for basic classroom-only protection. This password is baked into the static JavaScript bundle, so it is not secure authentication. It is intended to keep reset buttons away from normal student screens, not to protect sensitive data.

## Deploy to GitHub Pages

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Push the project to GitHub.
2. In the repository, go to Settings -> Pages.
3. Set Source to GitHub Actions.
4. Add these repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_ADMIN_PASSWORD`
5. Optional: add a repository variable named `VITE_ENABLE_DEMO_MODE` only if you intentionally want demo tools in a non-production build. Leave it unset or `false` for the real meeting.
6. Push to `main` or run the workflow manually.

The workflow runs `npm test` before `npm run build` so broken answer-check logic stops the deploy.

The Vite `base` is set to `./` by default, which works well for GitHub Pages project sites. If you prefer an absolute base path, add a repository variable named `VITE_BASE_PATH` with:

```bash
/your-repository-name/
```

For example, if the GitHub repository is named `bug-hunt-arena`, set `VITE_BASE_PATH` to `/bug-hunt-arena/`.

## How To Use During The Meeting

1. Before students arrive, open `/#/admin`.
2. Unlock admin with the classroom password.
3. Click `Reset leaderboard`.
4. Put `/#/leaderboard` on the projector.
5. Ask students to open `/#/play` on Chromebooks.
6. Students enter one leaderboard name, either one student or a pair like `Alex + Brooke`.
7. Students edit the broken code directly, click `Check My Fix`, and get immediate feedback.
8. Keep the leaderboard visible. It updates live across devices through Firebase.

## Scoring

- Easy HTML/CSS levels: 100 points each
- Medium JavaScript levels: 150 points each
- Hard mixed debugging levels: 250 points each
- Speed bonus:
  - Finish in 20 minutes or less: +75
  - Finish in 35 minutes or less: +50
  - Finish in 45 minutes or less: +25

## Optional Local Testing Mode

The production default is not demo mode. For the real LBHS Coding Club meeting, keep:

```bash
VITE_ENABLE_DEMO_MODE=false
```

For local layout testing only, you can set `VITE_ENABLE_DEMO_MODE=true`. That unlocks:

- A `Demo projector view` toggle on `/#/leaderboard`.
- `Add demo players` and `Clear demo data` tools on `/#/admin`.
- Local browser storage as a fallback if Firebase is not configured.

Local testing mode does not sync across devices unless Firebase is configured. Do not use it for the real classroom run.

## Editing Challenges

Challenge data lives in `src/data/challenges.js`.

Each challenge includes:

- `title`: the level title
- `story`: the short student-facing prompt
- `goal`: what students should fix
- `brokenCode`: the code displayed in the challenge
- `points`: the score value
- `answer.accepted`: code patterns or fix phrases that count as correct
- `answer.forbidden`: buggy code patterns that should not remain in the edited code
- `answer.required`: code pattern groups for challenges that require several ideas
- `hint`: feedback when the answer is not correct yet

Students fix code directly in the app. Answer checking ignores harmless spacing differences, rejects common unchanged buggy patterns, and accepts several correct variations. For multi-part fixes, add a new inner array to `required` for each required idea.

Example:

```js
required: [
  ['let i = 0', 'i=0', 'start at 0'],
  ['i < bugs.length', 'change <= to <'],
  ['#bugs', 'id selector']
]
```

The edited code is correct when it matches at least one item from every required group and does not contain any forbidden pattern.

## Classroom Reliability Tips

- Use a dedicated Firebase Realtime Database for LBHS Coding Club activities.
- Reset the leaderboard before students join.
- Test the projector view with one real test player, then reset the leaderboard.
- Keep the leaderboard open in one browser tab and the admin page in another.
- Use partner display names like `Alex + Brooke` so pairs show clearly.
- Remind students that spacing is flexible, but the actual buggy code needs to be changed in the editor.
- If the app shows `Firebase setup required`, the production build is missing Firebase environment variables.
- Lock down or delete the Firebase database after the meeting if you do not plan to reuse it.

## Production Readiness Checklist

- `npm test` passes.
- `npm run build` completes locally or in GitHub Actions.
- GitHub repository secrets contain all `VITE_FIREBASE_*` values and `VITE_ADMIN_PASSWORD`.
- `VITE_ENABLE_DEMO_MODE` is unset or `false` for the real meeting.
- Firebase Realtime Database rules are installed for the activity database.
- `/#/leaderboard` is opened on the projector and tested with a real test player.
- The leaderboard is reset before students start the real run.

## Project Structure

```text
src/
  components/        Reusable UI pieces
  data/challenges.js Editable challenge content and scoring
  data/demoPlayers.js Optional local testing entries
  hooks/usePlayers.js Live player subscription hook
  pages/             Play, leaderboard, admin, and not-found screens
  services/          Firebase and leaderboard storage helpers
  utils/             Answer checking and formatting helpers
```
