import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import KanbanBoard from './components/KanbanBoard';
import GlobalCreateModal from './components/GlobalCreateModal';
import Toast from './components/Toast';

const API_BASE = '/api';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Mostra notifiche Toast
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Caricamento ticket con filtro opzionale
  const loadTickets = useCallback(async () => {
    try {
      let url = `${API_BASE}/tickets`;
      if (selectedClient) {
        url += `?cliente=${encodeURIComponent(selectedClient)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Impossibile caricare i ticket`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    }
  }, [selectedClient, addToast]);

  // Caricamento lista clienti univoci
  const loadClients = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/clienti`);
      if (!res.ok) return;
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.warn('Errore recupero clienti:', err);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Timer per aggiornare real-time il controllo SLA scaduto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Creazione ticket (sia da inline che da modal)
  const handleCreateTicket = async (ticketData) => {
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}`);
      }

      const created = await res.json();
      addToast(`Ticket #${created.id} aggiunto in "${created.stato}"!`, 'success');

      await loadTickets();
      await loadClients();
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Spostamento di stato (tramite Drag & Drop con mouse o pulsanti < >)
  const handleMoveTicket = async (ticketId, nextState) => {
    try {
      // Aggiornamento ottimistico
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, stato: nextState } : t))
      );

      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: nextState })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}`);
      }

      const updated = await res.json();
      addToast(`Ticket #${updated.id} spostato in "${nextState}"`, 'info');
      await loadTickets();
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
      await loadTickets(); // Ripristina in caso di errore
    }
  };

  // Eliminazione ticket
  const handleDeleteTicket = async (ticketId) => {
    try {
      // Rimozione ottimistica
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));

      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}`);
      }

      addToast(`Ticket #${ticketId} eliminato con successo.`, 'success');
      await loadTickets();
      await loadClients();
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
      await loadTickets();
    }
  };

  // Filtra localmente se necessario
  const displayedTickets = selectedClient
    ? tickets.filter((t) => t.cliente.toLowerCase() === selectedClient.toLowerCase())
    : tickets;

  return (
    <div className="app-root">
      <Header />

      <main className="main-container">
        <Toolbar
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={setSelectedClient}
          onResetFilter={() => setSelectedClient('')}
          totalCount={displayedTickets.length}
          onOpenCreateModal={() => setIsModalOpen(true)}
        />

        <KanbanBoard
          tickets={displayedTickets}
          clients={clients}
          onMoveTicket={handleMoveTicket}
          onDeleteTicket={handleDeleteTicket}
          onCreateTicket={handleCreateTicket}
        />
      </main>

      <GlobalCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
        onSubmit={handleCreateTicket}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />

      <footer className="app-footer">
        <p>
          B2B Helpdesk & SLA Kanban Board • React Application • Drag & Drop con Mouse & Creazione Diretta da Board
        </p>
      </footer>
    </div>
  );
}
