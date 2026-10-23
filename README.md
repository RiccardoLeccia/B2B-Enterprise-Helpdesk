# B2B Helpdesk & SLA Kanban Board

Applicazione enterprise full-stack per la gestione dell'assistenza tecnica B2B e il monitoraggio in tempo reale dei Service Level Agreement (SLA).

Progetto realizzato in piena conformità al documento di Onboarding Tecnico per Sviluppatori Full-Stack.

---

## 🛠️ Stack Tecnologico

- **Backend**: Node.js, Express.js (porta `3000`), `cors`, `express.json()`, persistenza dati tramite array in-memory pre-popolato.
- **Frontend**: Single Page Application (SPA) realizzata in HTML5 semantico, CSS3 moderno (con animazioni semantiche e layout responsive) e JavaScript Vanilla (`fetch` API, `async/await`). Nessun reload della pagina.

---

## 🚀 Avvio dell'Applicazione

1. **Installazione dipendenze**:
   ```bash
   npm install
   ```

2. **Avvio del server**:
   ```bash
   npm start
   ```
   *oppure in modalità sviluppo (watch mode):*
   ```bash
   npm run dev
   ```

3. **Accesso all'interfaccia web**:
   Apri il browser su:
   [http://localhost:3000](http://localhost:3000)

---

## 📋 Specifiche di Progetto Realizzate

### 1. Modello Dati JSON Ticket
Ogni ticket include:
- `id`: identificativo univoco progressivo (Number)
- `titolo`: oggetto sintetico della segnalazione (String)
- `descrizione`: dettaglio tecnico del malfunzionamento (String)
- `cliente`: ragione sociale cliente B2B (String)
- `categoria`: `CRITICAL_BUG` | `SOFTWARE_BUG` | `SECURITY` | `CONFIGURAZIONE`
- `priorita`: `ALTA` (2h) | `MEDIA` (8h) | `BASSA` (24h)
- `stato`: `NEW` | `IN_PROGRESS` | `WAITING` | `RESOLVED`
- `assegnatario`: tecnico incaricato (String)
- `createdAt`: ISO Timestamp di creazione

### 2. Endpoints RESTful (`/api/tickets`)
- `GET /api/tickets`: Elenco ticket con supporto al parametro opzionale di filtro `?cliente=NomeCliente`
- `GET /api/tickets/:id`: Dettaglio del singolo ticket
- `GET /api/clienti`: Lista univoca dei clienti registrati
- `POST /api/tickets`: Creazione ticket (stato iniziale `NEW`, id e timestamp autogenerati)
- `PATCH /api/tickets/:id`: Aggiornamento dello stato e avanzamento nelle colonne Kanban
- `DELETE /api/tickets/:id`: Rimozione del ticket

### 3. Macchina a Stati e Flusso Kanban a 4 Colonne
1. **Nuovi Ticket (`NEW`)**
2. **In Lavorazione (`IN_PROGRESS`)**
3. **In Attesa Cliente (`WAITING`)**
4. **Risolti (`RESOLVED`)**

Pulsanti di azione su ciascuna card:
- `<`: arretra lo stato (disabilitato in `NEW`)
- `>`: avanza lo stato (disabilitato in `RESOLVED`)
- `🗑️`: eliminazione con richiesta di conferma

### 4. Matrice SLA e Feedback Grafico
- **ALTA** (SLA 2 ore): Badge semantico **Rosso** (`Critico`)
- **MEDIA** (SLA 8 ore): Badge semantico **Arancione** (`Allerta`)
- **BASSA** (SLA 24 ore): Badge semantico **Verde** (`Standard`)

### 5. Obiettivi di Eccellenza (Sfide Opzionali Implementate)
- ✅ **Filtro Cliente**: menu a tendina dinamico in cima alla board per filtrare per specifica azienda cliente o vista completa.
- ✅ **Alert SLA Scaduto**: le card con priorità `ALTA` rimaste nella colonna `NEW` da oltre 2 ore mostrano un **bordo rosso lampeggiante** animato (`@keyframes pulse-red`) e un banner di avviso immediato `⚠️ SLA SCADUTO`.
- ✅ **Contatore Ticket Dinamico**: conteggio in tempo reale del numero di ticket presenti nell'intestazione di ogni singola colonna (es. `Nuovi Ticket (3)`).

---

## ✅ Definition of Done
- [x] Backend attivo su Node.js + Express (porta 3000).
- [x] CORS abilitato per le chiamate API.
- [x] Gestione CRUD completa (Create, Read, Update/Move, Delete).
- [x] Reattività UI senza mai ricaricare la pagina (SPA).
- [x] Rispetto visivo dei badge SLA (Rosso / Arancione / Verde).
- [x] Sfide opzionali pienamente funzionanti.

