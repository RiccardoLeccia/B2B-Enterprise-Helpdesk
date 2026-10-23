/**
 * B2B Helpdesk & SLA Kanban Board
 * Frontend Application Logic (Vanilla JS, async/await, Fetch API)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configurazione API
  const API_BASE = '/api';

  // Stato dell'applicazione
  let tickets = [];
  let currentClientFilter = '';

  // Ordine sequenziale degli stati Kanban
  const KANBAN_STATES = ['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED'];

  // SLA Temporale espresso in ore per priorità
  const SLA_HOURS = {
    ALTA: 2,
    MEDIA: 8,
    BASSA: 24
  };

  // Elementi DOM
  const ticketForm = document.getElementById('ticket-form');
  const filterClienteSelect = document.getElementById('filter-cliente');
  const btnResetFilter = document.getElementById('btn-reset-filter');
  const totalTicketsCountEl = document.getElementById('total-tickets-count');
  const toastContainer = document.getElementById('toast-container');
  const datalistClienti = document.getElementById('clienti-suggeriti');

  const columnContainers = {
    NEW: document.getElementById('col-NEW'),
    IN_PROGRESS: document.getElementById('col-IN_PROGRESS'),
    WAITING: document.getElementById('col-WAITING'),
    RESOLVED: document.getElementById('col-RESOLVED')
  };

  const columnCounters = {
    NEW: document.getElementById('counter-NEW'),
    IN_PROGRESS: document.getElementById('counter-IN_PROGRESS'),
    WAITING: document.getElementById('counter-WAITING'),
    RESOLVED: document.getElementById('counter-RESOLVED')
  };

  // =========================================================================
  // FUNZIONI DI CARICAMENTO E CHIAMATE API
  // =========================================================================

  /**
   * Recupera tutti i ticket dal backend Express
   */
  async function fetchTickets() {
    try {
      let url = `${API_BASE}/tickets`;
      if (currentClientFilter) {
        url += `?cliente=${encodeURIComponent(currentClientFilter)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}: Impossibile caricare i ticket.`);
      }

      tickets = await response.json();
      updateClientFilterOptions();
      renderBoard();
    } catch (error) {
      console.error('Errore durante il recupero dei ticket:', error);
      showToast(error.message, 'error');
    }
  }

  /**
   * Crea un nuovo ticket inviando una richiesta POST
   */
  async function createTicket(ticketData) {
    try {
      const response = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Errore HTTP ${response.status} durante la creazione.`);
      }

      const nuovoTicket = await response.json();
      showToast(`Ticket #${nuovoTicket.id} creato con successo in colonna NEW!`, 'success');
      
      // Reset form e ricarica i dati senza reload di pagina
      ticketForm.reset();
      document.getElementById('select-priorita').value = 'MEDIA';
      document.getElementById('select-categoria').value = 'CRITICAL_BUG';
      await fetchTickets();
    } catch (error) {
      console.error('Errore durante la creazione del ticket:', error);
      showToast(error.message, 'error');
    }
  }

  /**
   * Aggiorna lo stato del ticket con chiamata PATCH
   */
  async function updateTicketState(id, nuovoStato) {
    try {
      const response = await fetch(`${API_BASE}/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: nuovoStato })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Errore HTTP ${response.status} durante lo spostamento.`);
      }

      const updated = await response.json();
      showToast(`Ticket #${updated.id} spostato in "${formatStateName(nuovoStato)}"`, 'info');
      await fetchTickets();
    } catch (error) {
      console.error('Errore aggiornamento ticket:', error);
      showToast(error.message, 'error');
    }
  }

  /**
   * Elimina un ticket con chiamata DELETE
   */
  async function deleteTicket(id) {
    const conferma = window.confirm(`Sei sicuro di voler eliminare definitivamente il ticket #${id}?`);
    if (!conferma) return;

    try {
      const response = await fetch(`${API_BASE}/tickets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Errore HTTP ${response.status} durante l'eliminazione.`);
      }

      showToast(`Ticket #${id} eliminato con successo.`, 'success');
      await fetchTickets();
    } catch (error) {
      console.error('Errore eliminazione ticket:', error);
      showToast(error.message, 'error');
    }
  }

  // =========================================================================
  // RENDERING KANBAN BOARD & COMPONENTI UI
  // =========================================================================

  /**
   * Renderizza l'intera Kanban Board a 4 colonne
   */
  function renderBoard() {
    // Svuota le colonne
    Object.keys(columnContainers).forEach(state => {
      columnContainers[state].innerHTML = '';
    });

    // Filtra localmente se necessario (o usa i ticket già filtrati)
    const displayedTickets = currentClientFilter
      ? tickets.filter(t => t.cliente.toLowerCase() === currentClientFilter.toLowerCase())
      : tickets;

    // Raggruppa i ticket per stato
    const grouped = {
      NEW: [],
      IN_PROGRESS: [],
      WAITING: [],
      RESOLVED: []
    };

    displayedTickets.forEach(t => {
      if (grouped[t.stato]) {
        grouped[t.stato].push(t);
      }
    });

    // Aggiorna i contatori dinamici (Obiettivo di Eccellenza)
    Object.keys(grouped).forEach(state => {
      const count = grouped[state].length;
      if (columnCounters[state]) {
        columnCounters[state].textContent = count;
      }

      // Se non ci sono ticket, mostra placeholder
      if (count === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-placeholder';
        emptyDiv.textContent = 'Nessun ticket presente';
        columnContainers[state].appendChild(emptyDiv);
      } else {
        // Renderizza le card
        grouped[state].forEach(ticket => {
          const cardEl = createTicketCardElement(ticket);
          columnContainers[state].appendChild(cardEl);
        });
      }
    });

    // Aggiorna conteggio totale in alto a destra del pannello filtro
    if (totalTicketsCountEl) {
      totalTicketsCountEl.textContent = `Totale: ${displayedTickets.length} ticket`;
    }
  }

  /**
   * Crea il nodo DOM per la card del ticket conforme all'anatomia richiesta
   */
  function createTicketCardElement(ticket) {
    const card = document.createElement('article');
    card.className = 'ticket-card';
    card.setAttribute('data-id', ticket.id);

    // Calcolo Scadenza SLA per Priorità ALTA in stato NEW (Obiettivo di Eccellenza)
    const isSlaExpired = checkIsSlaExpired(ticket);
    if (isSlaExpired) {
      card.classList.add('sla-expired');
    }

    const stateIndex = KANBAN_STATES.indexOf(ticket.stato);
    const canMoveBack = stateIndex > 0;
    const canMoveForward = stateIndex < KANBAN_STATES.length - 1;

    const prevState = canMoveBack ? KANBAN_STATES[stateIndex - 1] : null;
    const nextState = canMoveForward ? KANBAN_STATES[stateIndex + 1] : null;

    // Etichetta del badge SLA
    const priorityBadgeClass = `badge-${ticket.priorita.toLowerCase()}`;
    const priorityHours = SLA_HOURS[ticket.priorita] || 24;

    card.innerHTML = `
      <!-- Header Card: Cliente B2B + Badge Priorità Semantico -->
      <div class="card-header">
        <div class="client-name" title="Cliente B2B">
          <span class="client-icon">🏢</span>
          <span>${escapeHtml(ticket.cliente)}</span>
        </div>
        <span class="sla-badge ${priorityBadgeClass}" title="SLA Scadenza: ${priorityHours} ore">
          ${ticket.priorita} (${priorityHours}h)
        </span>
      </div>

      <!-- Alert Grafico SLA Scaduto (se applicabile) -->
      ${isSlaExpired ? `
        <div class="sla-alert-banner" role="alert">
          <span>⚠️</span> <span>SLA SCADUTO! Ticket bloccato in NEW > 2h</span>
        </div>
      ` : ''}

      <!-- Corpo Card: Titolo in grassetto + Descrizione -->
      <div class="card-body">
        <h4 class="ticket-title">${escapeHtml(ticket.titolo)}</h4>
        <p class="ticket-desc">${escapeHtml(ticket.descrizione)}</p>
      </div>

      <!-- Footer Card: Categoria & Assegnatario (SX) + Azioni (DX) -->
      <div class="card-footer">
        <div class="meta-info">
          <span class="meta-category">${escapeHtml(ticket.categoria)}</span>
          <span class="meta-assignee">👤 ${escapeHtml(ticket.assegnatario)}</span>
        </div>
        <div class="card-actions">
          <button type="button" class="action-btn btn-prev" data-id="${ticket.id}" data-target-state="${prevState || ''}" title="Arretra stato (${prevState || ''})" ${!canMoveBack ? 'disabled' : ''}>
            &lt;
          </button>
          <button type="button" class="action-btn btn-next" data-id="${ticket.id}" data-target-state="${nextState || ''}" title="Avanza stato (${nextState || ''})" ${!canMoveForward ? 'disabled' : ''}>
            &gt;
          </button>
          <button type="button" class="action-btn btn-delete" data-id="${ticket.id}" title="Elimina ticket">
            🗑️
          </button>
        </div>
      </div>
    `;

    // Assegnazione eventi sui pulsanti della card
    const btnPrev = card.querySelector('.btn-prev');
    const btnNext = card.querySelector('.btn-next');
    const btnDel = card.querySelector('.btn-delete');

    if (canMoveBack) {
      btnPrev.addEventListener('click', () => updateTicketState(ticket.id, prevState));
    }

    if (canMoveForward) {
      btnNext.addEventListener('click', () => updateTicketState(ticket.id, nextState));
    }

    btnDel.addEventListener('click', () => deleteTicket(ticket.id));

    return card;
  }

  /**
   * Verifica se un ticket ha sforato il vincolo SLA
   * (In particolare: Priorità ALTA rimasto in NEW oltre 2 ore da createdAt)
   */
  function checkIsSlaExpired(ticket) {
    if (ticket.stato !== 'NEW') return false;
    if (ticket.priorita !== 'ALTA') return false;

    if (!ticket.createdAt) return false;
    const createdTimestamp = new Date(ticket.createdAt).getTime();
    if (isNaN(createdTimestamp)) return false;

    const diffHours = (Date.now() - createdTimestamp) / (1000 * 60 * 60);
    return diffHours >= SLA_HOURS.ALTA; // >= 2 ore
  }

  /**
   * Popola dinamicamente il menu a tendina dei clienti (Filtro Clienti)
   */
  async function updateClientFilterOptions() {
    try {
      const response = await fetch(`${API_BASE}/clienti`);
      if (!response.ok) return;

      const clienti = await response.json();

      // Aggiorna datalist suggerimenti form
      if (datalistClienti) {
        datalistClienti.innerHTML = '';
        clienti.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          datalistClienti.appendChild(opt);
        });
      }

      // Aggiorna select filtro
      if (filterClienteSelect) {
        const valPrecedente = filterClienteSelect.value;
        filterClienteSelect.innerHTML = '<option value="">Tutti i Clienti (Vista Completa)</option>';

        clienti.forEach(cliente => {
          const opt = document.createElement('option');
          opt.value = cliente;
          opt.textContent = cliente;
          if (cliente === valPrecedente) {
            opt.selected = true;
          }
          filterClienteSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.warn('Impossibile aggiornare la lista clienti:', err);
    }
  }

  // =========================================================================
  // GESTORI EVENTI FORM E FILTRI
  // =========================================================================

  // Sottomissione Form Nuovo Ticket
  ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titolo = document.getElementById('input-titolo').value.trim();
    const cliente = document.getElementById('input-cliente').value.trim();
    const categoria = document.getElementById('select-categoria').value;
    const priorita = document.getElementById('select-priorita').value;
    const assegnatario = document.getElementById('input-assegnatario').value.trim();
    const descrizione = document.getElementById('input-descrizione').value.trim();

    if (!titolo || !cliente || !categoria || !priorita || !assegnatario || !descrizione) {
      showToast('Compila tutti i campi obbligatori prima di salvare.', 'error');
      return;
    }

    const newTicketData = {
      titolo,
      descrizione,
      cliente,
      categoria,
      priorita,
      assegnatario
    };

    await createTicket(newTicketData);
  });

  // Cambio opzione Filtro Clienti
  filterClienteSelect.addEventListener('change', (e) => {
    currentClientFilter = e.target.value.trim();
    fetchTickets();
  });

  // Reset del filtro
  btnResetFilter.addEventListener('click', () => {
    currentClientFilter = '';
    filterClienteSelect.value = '';
    fetchTickets();
  });

  // =========================================================================
  // FUNZIONI DI UTILITÀ (TOAST, FORMATTAZIONE, ESCAPING)
  // =========================================================================

  function formatStateName(state) {
    const map = {
      NEW: 'Nuovi Ticket',
      IN_PROGRESS: 'In Lavorazione',
      WAITING: 'In Attesa Cliente',
      RESOLVED: 'Risolti'
    };
    return map[state] || state;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // AVVIO APPLICAZIONE & TIMER SLA REALTIME
  // =========================================================================

  // Primo caricamento dati
  fetchTickets();

  // Controllo periodico ogni 30 secondi per aggiornare gli alert di scadenza SLA
  setInterval(() => {
    renderBoard();
  }, 30000);
});

