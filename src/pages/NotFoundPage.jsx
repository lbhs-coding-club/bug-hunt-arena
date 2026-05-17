import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page narrow-page">
      <div className="panel">
        <p className="eyebrow">LBHS Coding Club</p>
        <h1>That route is not in the arena.</h1>
        <p>Head back to the student game and keep debugging.</p>
        <Link className="button primary" to="/play">
          Go to Play
        </Link>
      </div>
    </section>
  );
}
