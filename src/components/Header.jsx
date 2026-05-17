import { useState } from 'react';
import { Bug, Menu, Monitor, ShieldCheck, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/play', label: 'Play', icon: Bug },
  { to: '/leaderboard', label: 'Leaderboard', icon: Monitor },
  { to: '/admin', label: 'Admin', icon: ShieldCheck }
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <NavLink
        to="/play"
        className="brand-link"
        aria-label="LBHS Coding Club home"
        onClick={() => setMenuOpen(false)}
      >
        <img src="./lbhs-bug-hunt-badge.svg" alt="" className="brand-badge" />
        <span>
          <strong>LBHS Coding Club</strong>
          <small>Bug Hunt Arena</small>
        </span>
      </NavLink>

      <div className="menu-wrap">
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <nav id="site-menu" className={`menu-panel ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <p className="menu-label">LBHS Coding Club menu</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
