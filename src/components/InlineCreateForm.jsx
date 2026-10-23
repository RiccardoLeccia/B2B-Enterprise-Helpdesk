import React, { useState } from 'react';

const CATEGORIE = ['CRITICAL_BUG', 'SOFTWARE_BUG', 'SECURITY', 'CONFIGURAZIONE'];
const PRIORITA = [
  { value: 'ALTA', label: 'ALTA (SLA: 2h - Critico)' },
  { value: 'MEDIA', label: 'MEDIA (SLA: 8h - Allerta)' },
  { value: 'BASSA', label: 'BASSA (SLA: 24h - Standard)' }
];

export default function InlineCreateForm({ columnState, clients, onSubmit, onCancel }) {
  const [titolo, setTitolo] = useState('');
  const [cliente, setCliente] = useState('');
  const [categoria, setCategoria] = useState('CRITICAL_BUG');
  const [priorita, setPriorita] = useState('MEDIA');
  const [assegnatario, setAssegnatario] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        assegnatario: assegnatario.trim(),
        descrizione: descrizione.trim(),
        stato: columnState
      });
      // Reset
      setTitolo('');
      setCliente('');
      setAssegnatario('');
      setDescrizione('');
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inline-create-card">
      <div className="inline-create-header">
        <strong>Nuovo Ticket in questa colonna</strong>
      </div>
      <form onSubmit={handleSubmit} className="inline-create-form">
        <input
          type="text"
          className="form-control-sm"
          placeholder="Titolo / Oggetto del problema *"
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
          required
          autoFocus
        />

        <input
          type="text"
          className="form-control-sm"
          list="inline-clients-list"
          placeholder="Cliente B2B *"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          required
        />
        <datalist id="inline-clients-list">
          {clients.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <div className="inline-form-row">
          <select
            className="form-control-sm"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {CATEGORIE.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="form-control-sm"
            value={priorita}
            onChange={(e) => setPriorita(e.target.value)}
          >
            {PRIORITA.map((p) => (
              <option key={p.value} value={p.value}>
                {p.value}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          className="form-control-sm"
          placeholder="Tecnico assegnato *"
          value={assegnatario}
          onChange={(e) => setAssegnatario(e.target.value)}
          required
        />

        <textarea
          className="form-control-sm"
          rows={2}
          placeholder="Descrizione tecnica del problema *"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          required
        />

        <div className="inline-create-actions">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvataggio...' : '✓ Aggiungi Card'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
