import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';

const COLUMNS = [
  {
    state: 'NEW',
    title: 'Nuovi Ticket',
    icon: '📌',
    headerClass: 'col-new-header'
  },
  {
    state: 'IN_PROGRESS',
    title: 'In Lavorazione',
    icon: '⚙️',
    headerClass: 'col-inprogress-header'
  },
  {
    state: 'WAITING',
    title: 'In Attesa Cliente',
    icon: '⏳',
    headerClass: 'col-waiting-header'
  },
  {
    state: 'RESOLVED',
    title: 'Risolti',
    icon: '✅',
    headerClass: 'col-resolved-header'
  }
];

export default function KanbanBoard({
  tickets,
  clients,
  onMoveTicket,
  onDeleteTicket,
  onCreateTicket
}) {
  const [draggedTicket, setDraggedTicket] = useState(null);

  const handleDragStart = (ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
  };

  const handleDropOnColumn = (targetState) => {
    if (!draggedTicket) return;

    if (draggedTicket.stato !== targetState) {
      onMoveTicket(draggedTicket.id, targetState);
    }

    setDraggedTicket(null);
  };

  return (
    <section className="kanban-wrapper">
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter((t) => t.stato === col.state);
          return (
            <KanbanColumn
              key={col.state}
              columnConfig={col}
              tickets={colTickets}
              clients={clients}
              draggedTicket={draggedTicket}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropTicket={handleDropOnColumn}
              onMoveTicket={onMoveTicket}
              onDeleteTicket={onDeleteTicket}
              onCreateTicket={onCreateTicket}
            />
          );
        })}
      </div>
    </section>
  );
}
