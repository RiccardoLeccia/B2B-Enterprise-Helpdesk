import React, { useState } from 'react';

const CATEGORIE = ['CRITICAL_BUG', 'SOFTWARE_BUG', 'SECURITY', 'CONFIGURAZIONE'];
const PRIORITA = [
  { value: 'ALTA', label: 'ALTA (SLA: 2 ore - Critico)' },
  { value: 'MEDIA', label: 'MEDIA (SLA: 8 ore - Allerta)' },
  { value: 'BASSA', label: 'BASSA (SLA: 24 ore - Standard)' }
];
const STATI = [
  { value: 'NEW', label: 'Nuovi Ticket (NEW)' },
  { value: 'IN_PROGRESS', label: 'In Lavorazione (IN_PROGRESS)' },
  { value: 'WAITING', label: 'In Attesa Cliente (WAITING)' },
  { value: 'RESOLVED', label: 'Risolti (RESOLVED)' }
];

export default function GlobalCreateModal({ isOpen, onClose, clients, onSubmit }) {
  const [titolo, setTitolo] = useState('');
  const [cliente, setCliente] = useState('');
  const [categoria, setCategoria] = useState('CRITICAL_BUG');
  const [priorita, setPriorita] = useState('MEDIA');
  const [stato, setStato] = useState('NEW');
  const [assegnatario, setAssegnatario] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titolo.trim() || !cliente.trim() || !assegnatario.trim() || !descrizione.trim()) {
      alert('Compila tutti i campi obbligatori.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        titolo: titolo.trim(),
        cliente: cliente.trim(),
        categoria,
        priorita,
        stato,
        assegnatario: assegnatario.trim(),
        descrizione: descrizione.trim()
      });
      // Reset
      setTitolo('');
      setCliente('');
      setAssegnatario('');
      setDescrizione('');
      setStato('NEW');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nuovo Ticket di Assistenza</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Titolo / Oggetto *</label>
              <input
                type="text"
                placeholder="Es. Errore 500 su Checkout"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Cliente B2B *</label>
              <input
                type="text"
                list="modal-clients-list"
                placeholder="Es. Axiom Global SpA"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
              />
              <datalist id="modal-clients-list">
                {clients.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Categoria *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                {CATEGORIE.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priorità SLA *</label>
              <select
                value={priorita}
                onChange={(e) => setPriorita(e.target.value)}
                required
              >
                {PRIORITA.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Colonna di Inserimento *</label>
              <select
                value={stato}
                onChange={(e) => setStato(e.target.value)}
                required
              >
                {STATI.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tecnico Assegnato *</label>
              <input
                type="text"
                placeholder="Es. Marco (DevOps)"
                value={assegnatario}
                onChange={(e) => setAssegnatario(e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Descrizione Tecnica *</label>
              <textarea
                rows={3}
                placeholder="Dettagli del problema..."
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvataggio...' : 'Crea Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
