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
  
  // Colonne della matrice: Quote (anno), Iscrizione (checkbox), Privacy (checkbox), Dati medici (checkbox), Liberatoria immagini (checkbox)
  const columns = [
    { key: 'doc_quota1', label: 'Quota anno', type: 'year' },
    { key: 'doc_quota2', label: 'Quota anno', type: 'year' },
    { key: 'doc_quota3', label: 'Quota anno', type: 'year' },
    { key: 'doc_quota4', label: 'Quota anno', type: 'year' },
    { key: 'doc_iscr', label: 'Iscrizione', type: 'checkbox' },
    { key: 'doc_priv', label: 'Privacy', type: 'checkbox' },
    { key: 'doc_san', label: 'Dati medici', type: 'checkbox' },
    { key: 'doc_liberatoria', label: 'Liberatoria immagini', type: 'checkbox' }
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
      
      if (col.type === 'checkbox') {
        // Gestione checkbox
        const isChecked = !!value;
        if (canEdit) {
          html += `
            <td class="border border-gray-300 p-2 text-center">
              <input 
                type="checkbox" 
                class="w-4 h-4" 
                ${isChecked ? 'checked' : ''}
                data-scout-id="${scout.id}"
                data-field="${col.key}"
                onchange="UI.updateDocumento({scoutId:'${scout.id}', field:'${col.key}', value:this.checked})"
              />
            </td>
          `;
        } else {
          html += `
            <td class="border border-gray-300 p-2 text-center">
              ${isChecked ? '✓' : '<span class="text-gray-400">-</span>'}
            </td>
          `;
        }
      } else if (col.type === 'year') {
        // Gestione anno (per quote)
        // Estrai l'anno dalla data se presente
        let yearValue = '';
        if (value) {
          const d = toDate(value);
          if (!isNaN(d.getTime())) {
            yearValue = d.getFullYear().toString();
          } else if (typeof value === 'string' && value.length === 4 && /^\d{4}$/.test(value)) {
            // Se è già solo un anno
            yearValue = value;
          }
        }
        
        // Anno corrente come minimo
        const currentYear = new Date().getFullYear();
        
        if (canEdit) {
          html += `
            <td class="border border-gray-300 p-1">
              <input 
                type="number" 
                min="${currentYear}" 
                max="2100" 
                step="1"
                class="w-full text-xs border border-gray-300 rounded px-1 py-0.5 text-center" 
                value="${yearValue}"
                placeholder="Anno"
                data-scout-id="${scout.id}"
                data-field="${col.key}"
                onchange="UI.updateDocumentoYear({scoutId:'${scout.id}', field:'${col.key}', value:this.value})"
              />
            </td>
          `;
        } else {
          html += `
            <td class="border border-gray-300 p-2 text-center">
              ${yearValue || '<span class="text-gray-400">-</span>'}
            </td>
          `;
        }
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

// Funzione per aggiornare un documento (checkbox)
UI.updateDocumento = async function({ scoutId, field, value }) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per modificare i documenti.', { type: 'error' });
    return;
  }
  if (!this.selectedStaffId) {
    this.showToast('Seleziona uno Staff per abilitare le modifiche.', { type: 'warning' });
    return;
  }
  
  try {
    // Carica i dati attuali dello scout
    const scout = (this.state.scouts || []).find(s => s.id === scoutId);
    if (!scout) {
      this.showToast('Esploratore non trovato', { type: 'error' });
      return;
    }
    
    // Prepara il payload con tutti i dati dello scout, aggiornando solo il campo modificato
    const payload = {
      ...scout,
      [field]: value ? true : null
    };
    
    // Rimuovi l'id dal payload (non va aggiornato)
    delete payload.id;
    
    await DATA.updateScout(scoutId, payload, this.currentUser);
    this.state = await DATA.loadAll();
    this.rebuildPresenceIndex();
    
    // Aggiorna la visualizzazione
    this.renderDocumentiMatrix();
    
    this.showToast('Documento aggiornato');
  } catch (error) {
    console.error('Errore aggiornamento documento:', error);
    this.showToast('Errore durante l\'aggiornamento: ' + error.message, { type: 'error', duration: 4000 });
  }
};

// Funzione per aggiornare un anno (quote e iscrizione)
UI.updateDocumentoYear = async function({ scoutId, field, value }) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per modificare i documenti.', { type: 'error' });
    return;
  }
  if (!this.selectedStaffId) {
    this.showToast('Seleziona uno Staff per abilitare le modifiche.', { type: 'warning' });
    return;
  }
  
  try {
    // Carica i dati attuali dello scout
    const scout = (this.state.scouts || []).find(s => s.id === scoutId);
    if (!scout) {
      this.showToast('Esploratore non trovato', { type: 'error' });
      return;
    }
    
    // Converte l'anno in una data (primo gennaio dell'anno)
    let dateValue = null;
    if (value && value.trim() !== '') {
      const year = parseInt(value);
      if (!isNaN(year) && year >= 2000 && year <= 2100) {
        dateValue = `${year}-01-01`;
      }
    }
    
    // Prepara il payload con tutti i dati dello scout, aggiornando solo il campo modificato
    const payload = {
      ...scout,
      [field]: dateValue
    };
    
    // Rimuovi l'id dal payload (non va aggiornato)
    delete payload.id;
    
    await DATA.updateScout(scoutId, payload, this.currentUser);
    this.state = await DATA.loadAll();
    this.rebuildPresenceIndex();
    
    // Aggiorna la visualizzazione
    this.renderDocumentiMatrix();
    
    this.showToast('Documento aggiornato');
  } catch (error) {
    console.error('Errore aggiornamento documento:', error);
    this.showToast('Errore durante l\'aggiornamento: ' + error.message, { type: 'error', duration: 4000 });
  }
};

