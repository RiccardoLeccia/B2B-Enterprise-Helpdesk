import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <span className="brand-badge">B2B ENTERPRISE • REACT</span>
          <h1>Helpdesk & SLA Kanban Board</h1>
          <p className="subtitle">
            Trascina con il mouse le card tra le colonne e gestisci i ticket direttamente dalla board
          </p>
        </div>
        <div className="header-sla-legend">
          <span className="legend-item">
            <span className="dot dot-alta"></span> ALTA (2h)
          </span>
          <span className="legend-item">
            <span className="dot dot-media"></span> MEDIA (8h)
          </span>
          <span className="legend-item">
            <span className="dot dot-bassa"></span> BASSA (24h)
          </span>
        </div>
      </div>
    </header>
  );
}
