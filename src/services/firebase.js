import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredKeys = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
const demoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

export const firebaseStatus = {
  configured: missingKeys.length === 0,
  missingKeys,
  demoModeEnabled,
  allowLocalDemoMode: missingKeys.length > 0 && demoModeEnabled,
  requiresSetup: missingKeys.length > 0 && !demoModeEnabled
};

export const firebaseApp = firebaseStatus.configured
  ? getApps()[0] || initializeApp(firebaseConfig)
  : null;

export const database = firebaseApp ? getDatabase(firebaseApp) : null;
