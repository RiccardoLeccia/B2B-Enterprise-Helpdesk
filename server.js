const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globali
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Costanti e validazioni consentite da specifica
const VALID_CATEGORIE = ['CRITICAL_BUG', 'SOFTWARE_BUG', 'SECURITY', 'CONFIGURAZIONE'];
const VALID_PRIORITA = ['ALTA', 'MEDIA', 'BASSA'];
const VALID_STATI = ['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED'];

// Database In-Memory pre-popolato con ticket realistici per B2B Enterprise Helpdesk
const now = Date.now();
let tickets = [
  {
    id: 1,
    titolo: 'Errore 500 su Endpoint Checkout',
    descrizione: 'Il gateway di pagamento restituisce errore interno del server (HTTP 500) durante il completamento dell\'ordine.',
    cliente: 'Axiom Global SpA',
    categoria: 'CRITICAL_BUG',
    priorita: 'ALTA', // SLA 2h - creato 3 ore fa: ALERT SLA SCADUTO
    stato: 'NEW',
    assegnatario: 'Marco (DevOps)',
    createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    titolo: 'Certificato SSL in scadenza su API Gateway',
    descrizione: 'Rinnovare certificato wildcard TLS prima delle ore 18:00 per evitare interruzioni di servizio verso i webhook bancari.',
    cliente: 'FinTech Bank Corp',
    categoria: 'SECURITY',
    priorita: 'ALTA',
    stato: 'IN_PROGRESS',
    assegnatario: 'Giulia (Security)',
    createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    titolo: 'Lentezza anomala caricamento catalogo prodotti',
    descrizione: 'Tempi di risposta medi superiori a 4.2 secondi nelle query di ricerca per taglia e colore.',
    cliente: 'Apex Store',
    categoria: 'SOFTWARE_BUG',
    priorita: 'MEDIA',
    stato: 'NEW',
    assegnatario: 'Luca (Backend)',
    createdAt: new Date(now - 45 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    titolo: 'Richiesta configurazione Webhook di Spedizione',
    descrizione: 'In attesa delle chiavi API di collaudo inviate dal team di logistica per testare i callback di consegna.',
    cliente: 'Nexus Logistics',
    categoria: 'CONFIGURAZIONE',
    priorita: 'MEDIA',
    stato: 'WAITING',
    assegnatario: 'Sara (Frontend)',
    createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    titolo: 'Aggiornamento indirizzo notifica report mensili',
    descrizione: 'Modificata la configurazione SMTP per recapitare i report finanziari al nuovo indirizzo del CFO.',
    cliente: 'Axiom Global SpA',
    categoria: 'CONFIGURAZIONE',
    priorita: 'BASSA',
    stato: 'RESOLVED',
    assegnatario: 'Marco (DevOps)',
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    titolo: 'Mancata riconciliazione batch notturno',
    descrizione: 'Il processo notturno di quadratura transazioni si è arrestato con eccezione di connessione al database secondario.',
    cliente: 'FinTech Bank Corp',
    categoria: 'CRITICAL_BUG',
    priorita: 'ALTA',
    stato: 'NEW', // ALTA recente (15 min fa, SLA non ancora scaduto)
    assegnatario: 'Luca (Backend)',
    createdAt: new Date(now - 15 * 60 * 1000).toISOString()
  }
];

let nextId = 7;

// ==========================================
// ROTTE API RESTful
// ==========================================

// 1. GET /api/tickets - Elenco di tutti i ticket (con eventuale filtro per cliente)
app.get('/api/tickets', (req, res) => {
  const { cliente } = req.query;
  let result = tickets;

  if (cliente && cliente.trim() !== '') {
    const filter = cliente.trim().toLowerCase();
    result = tickets.filter(t => t.cliente.toLowerCase() === filter);
  }

  res.status(200).json(result);
});

// 2. GET /api/clienti - Elenco univoco dei clienti (utility per il filtro frontend)
app.get('/api/clienti', (req, res) => {
  const clientiUnici = Array.from(new Set(tickets.map(t => t.cliente))).sort();
  res.status(200).json(clientiUnici);
});

// 3. GET /api/tickets/:id - Dettaglio di un singolo ticket
app.get('/api/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return res.status(404).json({ error: `Ticket con ID ${id} non trovato.` });
  }

  res.status(200).json(ticket);
});

// 4. POST /api/tickets - Creazione di un nuovo ticket
app.post('/api/tickets', (req, res) => {
  const { titolo, descrizione, cliente, categoria, priorita, assegnatario, stato } = req.body;

  // Validazione campi obbligatori
  if (!titolo || !descrizione || !cliente || !categoria || !priorita || !assegnatario) {
    return res.status(400).json({
      error: 'Tutti i campi sono obbligatori: titolo, descrizione, cliente, categoria, priorita, assegnatario.'
    });
  }

  // Validazione valori consentiti
  if (!VALID_CATEGORIE.includes(categoria)) {
    return res.status(400).json({
      error: `Categoria non valida. Valori ammessi: ${VALID_CATEGORIE.join(', ')}`
    });
  }

  if (!VALID_PRIORITA.includes(priorita)) {
    return res.status(400).json({
      error: `Priorità non valida. Valori ammessi: ${VALID_PRIORITA.join(', ')}`
    });
  }

  // Validazione stato (se fornito, altrimenti default a NEW)
  let statoIniziale = 'NEW';
  if (stato) {
    if (!VALID_STATI.includes(stato)) {
      return res.status(400).json({
        error: `Stato iniziale non valido. Valori ammessi: ${VALID_STATI.join(', ')}`
      });
    }
    statoIniziale = stato;
  }

  const nuovoTicket = {
    id: nextId++,
    titolo: String(titolo).trim(),
    descrizione: String(descrizione).trim(),
    cliente: String(cliente).trim(),
    categoria,
    priorita,
    stato: statoIniziale,
    assegnatario: String(assegnatario).trim(),
    createdAt: new Date().toISOString()
  };

  tickets.push(nuovoTicket);
  res.status(201).json(nuovoTicket);
});

// 5. PATCH /api/tickets/:id - Aggiornamento parziale (stato, ecc.)
app.patch('/api/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ticketIndex = tickets.findIndex(t => t.id === id);

  if (ticketIndex === -1) {
    return res.status(404).json({ error: `Ticket con ID ${id} non trovato.` });
  }

  const { stato, titolo, descrizione, categoria, priorita, assegnatario } = req.body;

  if (stato !== undefined) {
    if (!VALID_STATI.includes(stato)) {
      return res.status(400).json({
        error: `Stato non valido. Valori ammessi: ${VALID_STATI.join(', ')}`
      });
    }
    tickets[ticketIndex].stato = stato;
  }

  if (categoria !== undefined) {
    if (!VALID_CATEGORIE.includes(categoria)) {
      return res.status(400).json({ error: `Categoria non valida.` });
    }
    tickets[ticketIndex].categoria = categoria;
  }

  if (priorita !== undefined) {
    if (!VALID_PRIORITA.includes(priorita)) {
      return res.status(400).json({ error: `Priorità non valida.` });
    }
    tickets[ticketIndex].priorita = priorita;
  }

  if (titolo !== undefined) tickets[ticketIndex].titolo = String(titolo).trim();
  if (descrizione !== undefined) tickets[ticketIndex].descrizione = String(descrizione).trim();
  if (assegnatario !== undefined) tickets[ticketIndex].assegnatario = String(assegnatario).trim();

  res.status(200).json(tickets[ticketIndex]);
});

// 6. DELETE /api/tickets/:id - Eliminazione ticket
app.delete('/api/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ticketIndex = tickets.findIndex(t => t.id === id);

  if (ticketIndex === -1) {
    return res.status(404).json({ error: `Ticket con ID ${id} non trovato.` });
  }

  const rimosso = tickets.splice(ticketIndex, 1)[0];
  res.status(200).json({
    message: 'Ticket rimosso con successo',
    id: rimosso.id
  });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 B2B Helpdesk & SLA Kanban Board attivo!`);
  console.log(`📡 Server in ascolto su: http://localhost:${PORT}`);
  console.log(`📁 Frontend disponibile su: http://localhost:${PORT}/`);
  console.log(`====================================================`);
});

