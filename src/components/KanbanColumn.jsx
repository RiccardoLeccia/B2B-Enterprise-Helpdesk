import React, { useState } from 'react';
import TicketCard from './TicketCard';
import InlineCreateForm from './InlineCreateForm';

export default function KanbanColumn({
  columnConfig,
  tickets,
  clients,
  draggedTicket,
  onDragStart,
  onDragEnd,
  onDropTicket,
  onMoveTicket,
  onDeleteTicket,
  onCreateTicket
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreatingInline, setIsCreatingInline] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Solo se usciamo davvero dal container della colonna
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDropTicket) {
      onDropTicket(columnConfig.state);
    }
  };

  return (
    <div
      className={`kanban-column ${columnConfig.headerClass}-col ${
        isDragOver ? 'dropzone-active' : ''
      }`}
      data-state={columnConfig.state}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Intestazione Colonna con Contatore Dinamico */}
      <div className={`column-header ${columnConfig.headerClass}`}>
        <div className="col-title-wrap">
          <span className="col-icon">{columnConfig.icon}</span>
          <span className="col-title">{columnConfig.title}</span>
        </div>
        <span className="column-counter" id={`counter-${columnConfig.state}`}>
          {tickets.length}
        </span>
      </div>

      {/* Pulsante rapido per creare ticket direttamente in questa colonna */}
      <div className="column-toolbar">
        {!isCreatingInline ? (
          <button
            type="button"
            className="btn-add-inline"
            onClick={() => setIsCreatingInline(true)}
            title={`Aggiungi un nuovo ticket direttamente in ${columnConfig.title}`}
          >
            ＋ Aggiungi Ticket
          </button>
        ) : (
          <InlineCreateForm
            columnState={columnConfig.state}
            clients={clients}
            onSubmit={onCreateTicket}
            onCancel={() => setIsCreatingInline(false)}
          />
        )}
      </div>

      {/* Indicatore visivo di drop quando si trascina con il mouse */}
      {isDragOver && (
        <div className="drop-indicator">
          <span>Rilascia qui per spostare in "{columnConfig.title}"</span>
        </div>
      )}

      {/* Corpo della colonna con le Card */}
      <div className="column-body">
        {tickets.length === 0 && !isCreatingInline && !isDragOver && (
          <div className="empty-placeholder">Nessun ticket presente</div>
        )}

        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onMove={onMoveTicket}
            onDelete={onDeleteTicket}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isBeingDragged={draggedTicket && draggedTicket.id === ticket.id}
          />
        ))}
      </div>
    </div>
  );
}
