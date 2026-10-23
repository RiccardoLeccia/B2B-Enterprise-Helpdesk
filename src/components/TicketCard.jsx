import React, { useState } from 'react';

const SLA_HOURS = {
  ALTA: 2,
  MEDIA: 8,
  BASSA: 24
};

const KANBAN_STATES = ['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED'];

export default function TicketCard({
  ticket,
  onMove,
  onDelete,
  onDragStart,
  onDragEnd,
  isBeingDragged
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Verifica Scadenza SLA per Priorità ALTA in stato NEW
  const isSlaExpired = (() => {
    if (ticket.stato !== 'NEW' || ticket.priorita !== 'ALTA' || !ticket.createdAt) {
      return false;
    }
    const createdTimestamp = new Date(ticket.createdAt).getTime();
    if (isNaN(createdTimestamp)) return false;
    const diffHours = (Date.now() - createdTimestamp) / (1000 * 60 * 60);
    return diffHours >= SLA_HOURS.ALTA;
  })();

  const stateIndex = KANBAN_STATES.indexOf(ticket.stato);
  const canMoveBack = stateIndex > 0;
  const canMoveForward = stateIndex < KANBAN_STATES.length - 1;
  const prevState = canMoveBack ? KANBAN_STATES[stateIndex - 1] : null;
  const nextState = canMoveForward ? KANBAN_STATES[stateIndex + 1] : null;

  const priorityBadgeClass = `badge-${ticket.priorita.toLowerCase()}`;
  const priorityHours = SLA_HOURS[ticket.priorita] || 24;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', String(ticket.id));
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) {
      onDragStart(ticket);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Sei sicuro di voler eliminare il ticket #${ticket.id}: "${ticket.titolo}"?`
    );
    if (confirmDelete) {
      setIsDeleting(true);
      onDelete(ticket.id);
    }
  };

  return (
    <article
      className={`ticket-card ${isSlaExpired ? 'sla-expired' : ''} ${
        isBeingDragged ? 'is-dragging' : ''
      }`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-id={ticket.id}
      title="Trascina con il mouse per spostare questa card in un'altra colonna"
    >
      {/* Header Card: Cliente B2B + Badge Priorità Semantico */}
      <div className="card-header">
        <div className="client-name" title="Cliente B2B">
          <span className="client-icon">🏢</span>
          <span>{ticket.cliente}</span>
        </div>
        <span
          className={`sla-badge ${priorityBadgeClass}`}
          title={`SLA Scadenza: ${priorityHours} ore`}
        >
          {ticket.priorita} ({priorityHours}h)
        </span>
      </div>

      {/* Alert Grafico SLA Scaduto (Bordo rosso lampeggiante + banner) */}
      {isSlaExpired && (
        <div className="sla-alert-banner" role="alert">
          <span>⚠️</span>
          <span>SLA SCADUTO! Ticket bloccato in NEW &gt; 2h</span>
        </div>
      )}

      {/* Corpo Card: Titolo + Descrizione */}
      <div className="card-body">
        <h4 className="ticket-title">{ticket.titolo}</h4>
        <p className="ticket-desc">{ticket.descrizione}</p>
      </div>

      {/* Footer Card: Categoria & Tecnico + Pulsanti Azione */}
      <div className="card-footer">
        <div className="meta-info">
          <span className="meta-category">{ticket.categoria}</span>
          <span className="meta-assignee">👤 {ticket.assegnatario}</span>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="action-btn btn-prev"
            disabled={!canMoveBack}
            onClick={() => canMoveBack && onMove(ticket.id, prevState)}
            title={canMoveBack ? `Arretra a ${prevState}` : 'Inizio flusso'}
          >
            &lt;
          </button>
          <button
            type="button"
            className="action-btn btn-next"
            disabled={!canMoveForward}
            onClick={() => canMoveForward && onMove(ticket.id, nextState)}
            title={canMoveForward ? `Avanza a ${nextState}` : 'Completato'}
          >
            &gt;
          </button>
          <button
            type="button"
            className="action-btn btn-delete"
            disabled={isDeleting}
            onClick={handleDelete}
            title="Elimina ticket"
          >
            🗑️
          </button>
        </div>
      </div>
    </article>
  );
}
