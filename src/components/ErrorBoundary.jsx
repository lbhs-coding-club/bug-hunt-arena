import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <section className="page narrow-page">
          <div className="panel terminal center-panel">
            <p className="eyebrow">LBHS Coding Club system notice</p>
            <h1>Something glitched.</h1>
            <p>
              Refresh the page to rejoin Bug Hunt Arena. If the leaderboard was reset, enter your
              team name again from the play screen.
            </p>
            <button className="button primary" type="button" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
