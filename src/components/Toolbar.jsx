import React from 'react';

export default function Toolbar({
  clients,
  selectedClient,
  onClientChange,
  onResetFilter,
  totalCount,
  onOpenCreateModal
}) {
  return (
    <section className="toolbar-panel">
      <div className="filter-panel panel-card">
        <div className="filter-header">
          <div className="filter-title-group">
            <h3>Filtro Clienti B2B</h3>
            <span className="filter-count" id="total-tickets-count">
              Totale: {totalCount} ticket
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm btn-create-top"
            onClick={onOpenCreateModal}
          >
            <span className="btn-icon">＋</span> Nuovo Ticket
          </button>
        </div>

        <div className="filter-controls">
          <div className="select-wrapper">
            <select
              id="filter-cliente"
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
            >
              <option value="">Tutti i Clienti (Vista Completa)</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
          {selectedClient && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onResetFilter}
            >
              Azzera Filtro
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
