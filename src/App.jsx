import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PlayPage from './pages/PlayPage.jsx';
import MatrixRain from './components/MatrixRain.jsx';

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <MatrixRain />
        <Header />
        <ErrorBoundary>
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/play" replace />} />
              <Route path="/play" element={<PlayPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </div>
    </HashRouter>
  );
}
