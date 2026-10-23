# PROMPT PER LO SVILUPPO: B2B Helpdesk & SLA Kanban Board
```markdown
Sei un Senior Full-Stack Developer specializzato nello sviluppo di applicazioni web enterprise con architettura REST.
Il tuo compito è realizzare da zero un'applicazione web completa per il progetto:
"B2B Helpdesk & SLA Kanban Board" (Assistenza Tecnica Enterprise).

L'applicazione permette a un team di supporto B2B (per clienti in ambito Banche, E-commerce, Logistica, ecc.) di monitorare, smistare e gestire i ticket di assistenza tecnica in tempo reale nel pieno rispetto dei Service Level Agreement (SLA).

Fornisci il codice completo, pronto all'uso, senza omissioni né segnaposto (`// TODO`), strutturato in file puliti e modulari.

---

## 1. REQUISITI ARCHITETTURALI E STACK TECNOLOGICO

1. **Backend**:
   - Runtime: **Node.js**
   - Framework: **Express.js** in ascolto su porta **3000**
   - Middleware essenziali: `cors` (per consentire chiamate cross-origin) e `express.json()` (per il parsing del body JSON)
   - Database / Persistenza: **Array in-memory** pre-popolato con ticket realistici di test.
   - Servizio file statici: Express deve servire la cartella frontend (es. `public/` o file statici).

2. **Frontend (SPA - Single Page Application)**:
   - Linguaggi: **HTML5 semantico**, **CSS3 moderno**, **JavaScript Vanilla** (standard ES6+, `async/await`, Fetch API).
   - Reattività fluida: **nessun ricaricamento dell'intera pagina** durante inserimenti, avanzamenti di stato, filtri o eliminazioni.
   - Design moderno: interfaccia enterprise chiara, responsive, accessibile, con feedback visivi immediati per gli SLA.

---

## 2. MODELLO DATI (TICKET JSON)

Ogni ticket deve rispettare rigorosamente il seguente schema JSON:

```json
{
  "id": 1,
  "titolo": "Errore 500 su Endpoint Checkout",
  "descrizione": "Il sistema restituisce errore interno del server durante il salvataggio del pagamento.",
  "cliente": "Axiom Global SpA",
  "categoria": "CRITICAL_BUG",
  "priorita": "ALTA",
  "stato": "NEW",
  "assegnatario": "Marco (DevOps)",
  "createdAt": "2026-10-23T08:00:00.000Z"
}
```

### Specifiche dei Campi e Vincoli:
- `id` (Number): Identificativo univoco autoincrementale numerico generato dal backend.
- `titolo` (String, obbligatorio): Oggetto sintetico del problema.
- `descrizione` (String, obbligatoria): Dettaglio tecnico del malfunzionamento.
- `cliente` (String, obbligatorio): Ragione sociale del cliente B2B (es. "Axiom Global SpA", "FinTech Bank Corp", "Nexus Logistics", "Apex Store").
- `categoria` (String enum, obbligatoria): Valori ammessi:
  - `CRITICAL_BUG`
  - `SOFTWARE_BUG`
  - `SECURITY`
  - `CONFIGURAZIONE`
- `priorita` (String enum, obbligatoria):
  - `ALTA` (SLA di risoluzione: 2 ore)
  - `MEDIA` (SLA di risoluzione: 8 ore)
  - `BASSA` (SLA di risoluzione: 24 ore)
- `stato` (String enum, obbligatorio): Colonna di avanzamento Kanban:
  - `NEW` (Nuovi Ticket)
  - `IN_PROGRESS` (In Lavorazione)
  - `WAITING` (In Attesa Cliente)
  - `RESOLVED` (Risolti)
  I nuovi ticket inseriti partono sempre con stato iniziale `NEW`.
- `assegnatario` (String, obbligatorio): Tecnico o team responsabile (es. "Marco (DevOps)", "Giulia (Security)", "Luca (Backend)", "Sara (Frontend)").
- `createdAt` (String ISO Timestamp): Data/ora di creazione (usato per il monitoraggio della scadenza SLA).

---

## 3. SPECIFICHE API REST (BACKEND EXPRESS)

Configura i seguenti endpoint REST sotto il prefisso `/api/tickets`:

1. `GET /api/tickets`
   - Restituisce la lista di tutti i ticket attivi in formato JSON (status `200 OK`).
   - Supporta query parameter opzionale per filtro cliente: `GET /api/tickets?cliente=Axiom%20Global%20SpA`.
2. `GET /api/tickets/:id`
   - Restituisce il ticket con l'ID specificato (`200 OK`) o `404 Not Found` se non esiste.
3. `POST /api/tickets`
   - Crea un nuovo ticket.
   - Valida i campi obbligatori (`titolo`, `descrizione`, `cliente`, `categoria`, `priorita`, `assegnatario`).
   - Assegna automaticamente `id` autoincrementale, `stato: "NEW"` e `createdAt: new Date().toISOString()`.
   - Restituisce il ticket creato con status `201 Created`.
4. `PATCH /api/tickets/:id`
   - Permette l'aggiornamento parziale del ticket (in particolare lo `stato`).
   - Valida che il nuovo stato appartenga agli stati consentiti (`NEW`, `IN_PROGRESS`, `WAITING`, `RESOLVED`).
   - Restituisce il ticket aggiornato con status `200 OK`, oppure `404 Not Found`.
5. `DELETE /api/tickets/:id`
   - Rimuove il ticket dall'array in-memory.
   - Restituisce status `204 No Content` o `200 OK` con messaggio di conferma, oppure `404 Not Found`.

---

## 4. MACCHINA A STATI E REGOLE DI TRANSIZIONE (KANBAN)

La Kanban Board presenta 4 colonne sequenziali:
`NEW` <---> `IN_PROGRESS` <---> `WAITING` <---> `RESOLVED`
*(consentita anche la transizione diretta tra `IN_PROGRESS` <---> `RESOLVED`)*.

Ogni Card ticket ha tre pulsanti di azione dedicati:
- **Arretra (`<`)**: sposta il ticket allo stato logico precedente:
  - Da `RESOLVED` -> `WAITING` (oppure `IN_PROGRESS`)
  - Da `WAITING` -> `IN_PROGRESS`
  - Da `IN_PROGRESS` -> `NEW`
  - *Nota*: Se il ticket è in `NEW`, il pulsante `<` è disabilitato (`disabled`) o nascosto.
- **Avanza (`>`)**: sposta il ticket allo stato logico successivo:
  - Da `NEW` -> `IN_PROGRESS`
  - Da `IN_PROGRESS` -> `WAITING` (o `RESOLVED`)
  - Da `WAITING` -> `RESOLVED`
  - *Nota*: Se il ticket è in `RESOLVED`, il pulsante `>` è disabilitato (`disabled`) o nascosto.
- **Elimina (`🗑️`)**: invia una richiesta `DELETE` al server previa conferma e rimuove la card dal DOM.

---

## 5. UI/UX & ANATOMIA DELLA CARD FRONTEND

### A. Sezione Superiore (Form di Inserimento & Barra Strumenti)
- **Modulo di Inserimento**: Form intuitivo e compatto con:
  - Input `Titolo` (testo)
  - Textarea o input `Descrizione` (testo)
  - Input o Select `Cliente` (testo o selezione)
  - Select `Categoria`: `CRITICAL_BUG`, `SOFTWARE_BUG`, `SECURITY`, `CONFIGURAZIONE`
  - Select `Priorità`: `ALTA (SLA: 2h)`, `MEDIA (SLA: 8h)`, `BASSA (SLA: 24h)`
  - Input `Assegnatario` (es. "Marco (DevOps)")
  - Pulsante submit: "Crea Ticket"
  - Alla sottomissione: chiamata asincrona `POST /api/tickets`, reset dei campi del form, card aggiunta istantaneamente alla colonna `NEW` senza ricaricare la pagina.
- **Filtro per Cliente (Sfida Opzionale)**:
  - Menu a tendina in cima alla board con tutti i clienti unici registrati (inclusa l'opzione "Tutti i clienti").
  - Quando selezionato, aggiorna dinamicamente la visualizzazione dei ticket senza ricaricare la pagina.

### B. Le 4 Colonne Kanban
1. `Nuovi Ticket (NEW)`
2. `In Lavorazione (IN_PROGRESS)`
3. `In Attesa Cliente (WAITING)`
4. `Risolti (RESOLVED)`
- **Contatore Ticket Dinamico (Sfida Opzionale)**: L'intestazione di ciascuna colonna deve indicare il conteggio in tempo reale dei ticket presenti (es. `Nuovi Ticket (3)`).

### C. Anatomia della Card Ticket
Ogni card deve mostrare chiaramente:
1. **Intestazione**:
   - Ragione Sociale Cliente (es. `Axiom Global SpA`) in evidenza.
   - **Badge Priorità con Colori Semantici (Feedback Visivo SLA)**:
     - `ALTA`: Sfondo/testo **Rosso** (#dc2626 / #fee2e2) - *Critico (SLA: 2h)*
     - `MEDIA`: Sfondo/testo **Arancione** (#ea580c / #ffedd5) - *Allerta (SLA: 8h)*
     - `BASSA`: Sfondo/testo **Verde** (#16a34a / #dcfce7) - *Standard (SLA: 24h)*
2. **Corpo**:
   - `Titolo` del ticket in grassetto.
   - `Descrizione` tecnica (leggibile, con wrap del testo).
3. **Piè di Card (Footer)**:
   - A sinistra: Badge/testo con `Categoria` e `Tecnico Assegnato` (es. `CRITICAL_BUG | Marco (DevOps)`).
   - A destra: Pulsanti azione con stile iconico/accessibile:
     - `[ < ]` (sposta a sinistra)
     - `[ > ]` (sposta a destra)
     - `[ 🗑️ ]` (elimina ticket)
4. **Alert SLA Scaduto (Sfida Opzionale)**:
   - Se un ticket ha priorità `ALTA` e si trova nello stato `NEW` da più di 2 ore (calcolato confrontando `createdAt` con `Date.now()`, oppure simulato con data nel seed), applica una classe CSS con **bordo rosso lampeggiante** (`animation: pulse-red 1.5s infinite;`) e un'icona di allarme ⚠️.

---

## 6. STRUTTURA DEL PROGETTO DA GENERARE

Crea una struttura di file pulita e pronta:

```text
esame-rest/
├── package.json          # Dipendenze (express, cors) e script ("start": "node server.js")
├── server.js             # Server Express, routing REST, seed data in-memory
└── public/
    ├── index.html        # Struttura HTML5 (Form, Toolbar filtri, 4 Colonne Kanban)
    ├── styles.css        # Stili moderni, responsive grid/flexbox, badge semantici, animazione alert SLA
    └── app.js            # Logica frontend (fetch API, rendering DOM, gestione eventi, contatori, filtri)
```

---

## 7. DATI DI TEST (SEED IN-MEMORY)

Nel `server.js`, pre-popola l'array con almeno 5-6 ticket di test realistici rappresentativi dei vari stati, clienti e priorità:
- 1 ticket `ALTA` in `NEW` con `createdAt` impostato a 3 ore fa (per dimostrare visivamente l'Alert SLA Scaduto con bordo lampeggiante).
- 1 ticket `ALTA` in `IN_PROGRESS` per cliente bancario.
- 1 ticket `MEDIA` in `NEW` per cliente e-commerce.
- 1 ticket `MEDIA` in `WAITING` per cliente logistica.
- 1 ticket `BASSA` in `RESOLVED`.
- 1 ticket `CRITICAL_BUG` in `IN_PROGRESS`.

---

## 8. CHECKLIST DEFINITION OF DONE

Assicurati che la soluzione soddisfi al 100% tutti i punti del check di rilascio:
- [x] **Backend Attivo**: Server Node.js + Express avviabile con `npm start` in ascolto su porta `3000`.
- [x] **CORS Abilitato**: Middleware `cors()` attivo per consentire chiamate sicure.
- [x] **Gestione Dati Completa (CRUD)**: Creazione (POST), Lettura (GET con filtro cliente), Spostamento stato (PATCH), Eliminazione (DELETE) pienamente funzionanti.
- [x] **Reattività UI (SPA)**: Invio del form, cambi di stato ed eliminazioni aggiornano il DOM istantaneamente senza mai ricaricare la pagina.
- [x] **Rispetto SLA Visivo**: Badge semantici Rosso/Arancione/Verde immediatamente riconoscibili per ALTA, MEDIA, BASSA.
- [x] **Obiettivi di Eccellenza Inclusi**:
  - Filtro clienti a tendina funzionante.
  - Alert SLA Scaduto con bordo rosso pulsante su ticket ALTA rimasti in NEW.
  - Contatori numerici dinamici sui titoli delle 4 colonne.

---

Fornisci ora il codice completo per ciascun file (`package.json`, `server.js`, `public/index.html`, `public/styles.css`, `public/app.js`) e le istruzioni da terminale per installare le dipendenze e avviare l'applicazione.
```
