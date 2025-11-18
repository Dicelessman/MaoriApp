// documenti.js - Logica specifica per la pagina Documenti

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function() {
  this.renderDocumentiMatrix();
};

UI.renderDocumentiMatrix = function() {
  const container = this.qs('#documentiMatrix');
  if (!container) return;
  
  const scouts = (this.state.scouts || []).slice();
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  
  // Funzione helper per convertire date in formato YYYY-MM-DD
  const toYyyyMmDd = (x) => {
    if (!x) return '';
    const d = this.toJsDate ? this.toJsDate(x) : (x && x.toDate ? x.toDate() : new Date(x));
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };
  
  // Ordina esploratori per nome
  scouts.sort((a, b) => {
    const nomeA = `${a.nome || ''} ${a.cognome || ''}`.trim();
    const nomeB = `${b.nome || ''} ${b.cognome || ''}`.trim();
    return nomeA.localeCompare(nomeB, 'it');
  });
  
  // Colonne della matrice: Quote (I°, II°, III°, IV°), Iscrizione, Modulo sanitario, Modulo Privacy
  const columns = [
    { key: 'doc_quota1', label: 'Quota I° anno', type: 'date' },
    { key: 'doc_quota2', label: 'Quota II° anno', type: 'date' },
    { key: 'doc_quota3', label: 'Quota III° anno', type: 'date' },
    { key: 'doc_quota4', label: 'Quota IV° anno', type: 'date' },
    { key: 'doc_iscr', label: 'Iscrizione', type: 'date' },
    { key: 'doc_san', label: 'Modulo sanitario', type: 'date' },
    { key: 'doc_priv', label: 'Modulo Privacy', type: 'date' }
  ];
  
  // Verifica se l'utente può modificare
  const canEdit = !!(this.currentUser && this.selectedStaffId);
  
  // Genera la tabella
  let html = `
    <table class="min-w-full border-collapse border border-gray-300 text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left font-semibold sticky left-0 bg-gray-100 z-10 min-w-[200px]">Esploratore</th>
          ${columns.map(col => `<th class="border border-gray-300 p-2 text-center font-semibold min-w-[120px]">${col.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  scouts.forEach((scout, idx) => {
    const nomeCompleto = `${scout.nome || ''} ${scout.cognome || ''}`.trim();
    const bgClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    
    html += `
      <tr class="${bgClass}">
        <td class="border border-gray-300 p-2 font-medium sticky left-0 ${bgClass} z-10">
          <a href="scout2.html?id=${scout.id}" class="text-blue-600 hover:text-blue-800 hover:underline">${nomeCompleto || 'Senza nome'}</a>
        </td>
    `;
    
    columns.forEach(col => {
      const value = scout[col.key];
      const displayValue = value ? toYyyyMmDd(value) : '';
      const formattedDate = value ? (() => {
        const d = toDate(value);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      })() : '';
      
      if (canEdit) {
        // Cella editabile
        html += `
          <td class="border border-gray-300 p-1">
            <input 
              type="date" 
              class="w-full text-xs border border-gray-300 rounded px-1 py-0.5" 
              value="${displayValue}"
              data-scout-id="${scout.id}"
              data-field="${col.key}"
              onchange="UI.updateDocumento({scoutId:'${scout.id}', field:'${col.key}', value:this.value})"
            />
            ${formattedDate ? `<div class="text-xs text-gray-500 mt-1">${formattedDate}</div>` : ''}
          </td>
        `;
      } else {
        // Cella solo lettura
        html += `
          <td class="border border-gray-300 p-2 text-center">
            ${formattedDate || '<span class="text-gray-400">-</span>'}
          </td>
        `;
      }
    });
    
    html += `</tr>`;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
};

// Funzione per aggiornare un documento
UI.updateDocumento = async function({ scoutId, field, value }) {
  if (!this.currentUser) {
    alert('Devi essere loggato per modificare i documenti.');
    return;
  }
  if (!this.selectedStaffId) {
    alert('Seleziona uno Staff per abilitare le modifiche.');
    return;
  }
  
  try {
    // Carica i dati attuali dello scout
    const scout = (this.state.scouts || []).find(s => s.id === scoutId);
    if (!scout) {
      alert('Esploratore non trovato');
      return;
    }
    
    // Prepara il payload con tutti i dati dello scout, aggiornando solo il campo modificato
    const payload = {
      ...scout,
      [field]: value || null
    };
    
    // Rimuovi l'id dal payload (non va aggiornato)
    delete payload.id;
    
    await DATA.updateScout(scoutId, payload, this.currentUser);
    this.state = await DATA.loadAll();
    this.rebuildPresenceIndex();
    
    // Aggiorna la visualizzazione
    this.renderDocumentiMatrix();
    
    if (typeof this.showToast === 'function') {
      this.showToast('Documento aggiornato');
    } else {
      console.log('Documento aggiornato');
    }
  } catch (error) {
    console.error('Errore aggiornamento documento:', error);
    alert('Errore durante l\'aggiornamento: ' + error.message);
  }
};

