// liste.js
import { UI } from './js/ui/ui.js';
import { DATA } from './js/data/data-facade.js';
import { escapeHtml, toYyyyMmDd, toJsDate } from './js/utils/utils.js';

// Extend UI for Liste page
UI.currentTab = 'presenze';

UI.renderCurrentPage = async function () {
    this.showLoadingOverlay('Caricamento dati...');
    try {
        if (!this.state.scouts || !this.state.activities) {
            this.state = await DATA.loadAll();
        }

        if (!this.challengesData) {
            try {
                const res = await fetch('challenges.json');
                this.challengesData = await res.json();
            } catch(e) { console.error(e); }
        }
        if (!this.specialitaListData) {
            try {
                const res = await fetch('specialita.json');
                this.specialitaListData = await res.json();
            } catch(e) { console.error(e); }
        }

        // Setup Tabs
        this.setupTabs();

        // Render initial Tab
        this.renderTab(this.currentTab);

    } catch (error) {
        console.error('Error loading liste:', error);
        this.showToast('Errore nel caricamento delle liste', { type: 'error' });
    } finally {
        this.hideLoadingOverlay();
    }
};

UI.setupTabs = function () {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            buttons.forEach(b => {
                b.classList.remove('active', 'border-green-500', 'text-green-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            // Add active class
            btn.classList.add('active', 'border-green-500', 'text-green-600');
            btn.classList.remove('border-transparent', 'text-gray-500');

            // Show pane
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
            document.getElementById(`tab-${tab}`).classList.remove('hidden');

            this.currentTab = tab;
            this.renderTab(tab);
        });
    });
};

UI.renderTab = function (tabName) {
    switch (tabName) {
        case 'presenze': this.initPresenzeTab(); break;
        case 'elenco': this.initElencoTab(); break;
        case 'sfide': this.initSfideTab(); break;
        case 'prove': this.initProveTab(); break;
    }
};

/* --- 1. Presenze -n-- */
UI.initPresenzeTab = function () {
    const select = document.getElementById('activitySelect');
    // Always clear and populate to ensure fresh data
    select.innerHTML = '<option value="">-- Seleziona un\'attività --</option>';

    const acts = [...this.state.activities].sort((a, b) => toJsDate(a.data) - toJsDate(b.data));
    acts.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        const dateStr = toJsDate(a.data).toLocaleDateString('it-IT');
        opt.textContent = `${dateStr} - ${a.tipo} ${a.descrizione || ''}`;
        select.appendChild(opt);
    });

    // Listeners - Add only if not already added to avoid duplicates or use named functions
    // For simplicity in this structure, we can check a flag or just remove old ones if we could.
    // Given the structure, let's just make sure we don't re-bind if we already did.
    if (!select._bound) {
        select._bound = true;
        select.addEventListener('change', () => this.renderPresenzePreview());
        document.getElementById('presenzeShowDob').addEventListener('change', () => this.renderPresenzePreview());
        document.getElementById('presenzeSortMode').addEventListener('change', () => this.renderPresenzePreview());

        document.getElementById('printPresenzeBtn').addEventListener('click', () => this.printPresenzeList());
        document.getElementById('copyPresenzeBtn').addEventListener('click', () => this.copyPresenzeList());
        document.getElementById('csvPresenzeBtn').addEventListener('click', () => this.downloadPresenzeCSV());
    }
};

UI.renderPresenzePreview = async function () {
    const actId = document.getElementById('activitySelect').value;
    const showDob = document.getElementById('presenzeShowDob').checked;
    const sortMode = document.getElementById('presenzeSortMode').value;
    const container = document.getElementById('presenzePreview');
    const list = document.getElementById('presenzePreviewList');
    const btnPrint = document.getElementById('printPresenzeBtn');
    const btnCopy = document.getElementById('copyPresenzeBtn');
    const btnCsv = document.getElementById('csvPresenzeBtn');

    if (!actId) {
        container.classList.add('hidden');
        btnPrint.disabled = true;
        btnCopy.disabled = true;
        btnCsv.disabled = true;
        return;
    }

    container.classList.remove('hidden');
    btnPrint.disabled = false;
    btnCopy.disabled = false;
    btnCsv.disabled = false;
    list.innerHTML = 'Caricamento...';

    // Get presences
    // Note: presences are loaded all. We filter by activityId.
    // Presences structure: id: "scoutId_actId", esploratoreId, attivitaId, presente: boolean
    const presences = this.state.presences.filter(p => p.attivitaId === actId && p.stato === 'Presente');
    const presentScoutIds = new Set(presences.map(p => p.esploratoreId));

    // Get scouts
    let scouts = this.state.scouts.filter(s => presentScoutIds.has(s.id));

    // Sort
    scouts.sort((a, b) => {
        if (sortMode === 'surname') return (a.cognome || '').localeCompare(b.cognome || '');
        if (sortMode === 'name') return (a.nome || '').localeCompare(b.nome || '');
        if (sortMode === 'patrol') {
            const pA = a.pv_pattuglia || 'ZZZ'; // Put empty patrols at end
            const pB = b.pv_pattuglia || 'ZZZ';
            const patrolCampare = pA.localeCompare(pB);
            if (patrolCampare !== 0) return patrolCampare;
            return (a.cognome || '').localeCompare(b.cognome || ''); // Secondary sort by surname
        }
        return 0;
    });

    // Render
    const act = this.state.activities.find(a => a.id === actId);
    document.getElementById('presenzePreviewTitle').textContent = `Presenti: ${act.tipo} del ${toJsDate(act.data).toLocaleDateString()}`;

    list.innerHTML = '';

    // Group by patrol if selected
    let currentPatrol = null;

    scouts.forEach((s, idx) => {
        // Add patrol header if sorting by patrol and it changes
        if (sortMode === 'patrol') {
            const p = s.pv_pattuglia || 'Nessuna Pattuglia';
            if (p !== currentPatrol) {
                currentPatrol = p;
                const headerDiv = document.createElement('div');
                headerDiv.className = 'col-span-1 md:col-span-2 lg:col-span-3 font-bold bg-green-100 text-green-800 p-1 mt-2 rounded pl-2';
                headerDiv.textContent = `Pattuglia ${currentPatrol}`;
                list.appendChild(headerDiv);
            }
        }

        const div = document.createElement('div');
        div.className = 'p-2 border-b border-gray-100 flex justify-between items-center';
        div.dataset.name = `${s.nome} ${s.cognome}`; // Store for CSV
        div.dataset.dob = s.anag_dob ? toYyyyMmDd(s.anag_dob) : '';

        // Determine display name format
        let name = `${s.cognome} ${s.nome}`;
        if (sortMode === 'name') name = `${s.nome} ${s.cognome}`;

        let meta = '';
        if (showDob && s.anag_dob) {
            const date = new Date(s.anag_dob);
            meta += `<span class="text-xs text-gray-500 ml-2">${date.toLocaleDateString()}</span>`;
        }

        // Add role if present
        if (s.pv_vcp_cp) {
            meta += `<span class="text-xs font-bold text-blue-600 ml-1">(${s.pv_vcp_cp})</span>`;
        }

        div.innerHTML = `<span class="font-medium">${idx + 1}. ${escapeHtml(name)}</span> <div>${meta}</div>`;
        list.appendChild(div);
    });
};

UI.printPresenzeList = function () {
    // Simple print implementation using a print-only visible area
    const preview = document.getElementById('presenzePreview').innerHTML;
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
      <div class="print-header text-center mb-4">
         <h1 class="text-xl font-bold">Reparto Maori - Lista Presenze</h1>
         <p>${new Date().toLocaleDateString()}</p>
      </div>
      ${preview}
    `;
    window.print();
};

UI.copyPresenzeList = function () {
    const title = document.getElementById('presenzePreviewTitle').textContent;
    const listItems = document.querySelectorAll('#presenzePreviewList div');

    let text = `${title}\n\n`;
    listItems.forEach(div => {
        // Check if it's a patrol header
        if (div.textContent.trim().startsWith('Pattuglia')) {
            text += `\n${div.textContent.trim()}\n`;
            return;
        }

        // Extract text content cleanly (removing HTML tags but keeping structure)
        const nameSpan = div.querySelector('span.font-medium');
        if (nameSpan) {
            const name = nameSpan.textContent;
            const meta = div.querySelector('span.text-xs')?.textContent || '';
            text += `${name} ${meta ? '(' + meta + ')' : ''}\n`;
        }
    });

    // Robust copy with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('Lista copiata negli appunti'))
            .catch(err => {
                console.error('Clipboard API failed', err);
                this.fallbackCopyText(text);
            });
    } else {
        this.fallbackCopyText(text);
    }
};

UI.fallbackCopyText = function (text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        this.showToast('Lista copiata (fallback)');
    } catch (err) {
        console.error('Fallback copy failed', err);
        this.showToast('Impossibile copiare il testo', { type: 'error' });
    }
    document.body.removeChild(textArea);
};

UI.downloadCSV = function (filename, headers, rows, delimiter = ';') {
    const escapeCell = cell => {
        const str = cell == null ? '' : String(cell);
        return `"${str.replace(/"/g, '""')}"`;
    };
    const csvContent = [headers, ...rows]
        .map(row => row.map(escapeCell).join(delimiter))
        .join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast('File CSV scaricato con successo', { type: 'success' });
};

UI.downloadPresenzeCSV = function () {
    const actId = document.getElementById('activitySelect').value;
    if (!actId) return;

    const showDob = document.getElementById('presenzeShowDob').checked;
    const sortMode = document.getElementById('presenzeSortMode').value;
    const act = this.state.activities.find(a => a.id === actId);
    if (!act) return;

    const presences = (this.state.presences || []).filter(p => p.attivitaId === actId && p.stato === 'Presente');
    const presentScoutIds = new Set(presences.map(p => p.esploratoreId));
    let scouts = (this.state.scouts || []).filter(s => presentScoutIds.has(s.id));

    const headers = [];
    if (sortMode === 'patrol') headers.push('Pattuglia');
    headers.push('Cognome', 'Nome');
    if (showDob) headers.push('Data Nascita');
    headers.push('Stato');
    const hasCost = parseFloat(act.costo || '0') > 0;
    if (hasCost) headers.push('Pagamento', 'Metodo');

    scouts.sort((a, b) => {
        if (sortMode === 'surname') return (a.cognome || '').localeCompare(b.cognome || '');
        if (sortMode === 'name') return (a.nome || '').localeCompare(b.nome || '');
        if (sortMode === 'patrol') {
            const pA = a.pv_pattuglia || 'ZZZ';
            const pB = b.pv_pattuglia || 'ZZZ';
            const comp = pA.localeCompare(pB);
            if (comp !== 0) return comp;
            return (a.cognome || '').localeCompare(b.cognome || '');
        }
        return 0;
    });

    const rows = scouts.map(s => {
        const row = [];
        if (sortMode === 'patrol') row.push(s.pv_pattuglia || '');
        row.push(s.cognome || '', s.nome || '');
        if (showDob) {
            const d = s.anag_dob ? toYyyyMmDd(s.anag_dob) : '';
            row.push(d);
        }
        row.push('Presente');
        if (hasCost) {
            const p = presences.find(pr => pr.esploratoreId === s.id);
            row.push(p && p.pagato ? 'Saldato' : 'Da Saldare', (p && p.tipoPagamento) || '');
        }
        return row;
    });

    const actName = (act.tipo || 'presenze').replace(/[^a-z0-9]/gi, '_');
    const filename = `presenze_${actName}_${new Date().toISOString().slice(0, 10)}.csv`;
    this.downloadCSV(filename, headers, rows);
};

/* --- 2. Elenco Completo --- */
UI.initElencoTab = function () {
    // Listeners for columns
    const toggles = document.querySelectorAll('.col-toggle');
    toggles.forEach(t => {
        // Avoid double binding
        if (!t._bound) {
            t._bound = true;
            t.addEventListener('change', () => this.renderElencoTable());
        }
    });

    document.getElementById('printElencoBtn').onclick = () => {
        const table = document.getElementById('elencoTable').outerHTML;
        const printArea = document.getElementById('printArea');
        printArea.innerHTML = `
            <div class="print-header text-center mb-6">
                <h1 class="text-2xl font-bold">Elenco Esploratori Maori</h1>
            </div>
            ${table}
         `;
        window.print();
    };

    document.getElementById('copyElencoBtn').onclick = () => {
        // Simple Copy
        const rows = document.querySelectorAll('#elencoTable tbody tr');
        let text = "Elenco Maori\n\n";
        rows.forEach(r => {
            const cols = Array.from(r.querySelectorAll('td')).map(c => c.textContent.trim());
            text += cols.join('\t') + '\n';
        });

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => this.showToast('Copiato')).catch(() => this.fallbackCopyText(text));
        } else {
            this.fallbackCopyText(text);
        }
    };

    document.getElementById('csvElencoBtn').onclick = () => {
        // Headers
        const activeCols = Array.from(document.querySelectorAll('.col-toggle:checked')).map(c => c.dataset.col);
        const headers = ["Cognome", "Nome"];
        if (activeCols.includes('pattuglia')) headers.push("Pattuglia");
        if (activeCols.includes('passo')) headers.push("Passo");
        if (activeCols.includes('sfide')) headers.push("Sfide");
        if (activeCols.includes('specialita')) headers.push("Specialita");
        if (activeCols.includes('dob')) headers.push("Data Nascita");

        const rows = [];
        const tableRows = document.querySelectorAll('#elencoTable tbody tr');
        tableRows.forEach(r => {
            const cells = Array.from(r.querySelectorAll('td')).map(c => c.textContent.trim());
            if (cells.length > 0) {
                rows.push(cells);
            }
        });

        const filename = `elenco_maori_${new Date().toISOString().slice(0, 10)}.csv`;
        this.downloadCSV(filename, headers, rows);
    };

    // Populate Pattuglie Filter dynamically
    const pattuglieSet = new Set();
    this.state.scouts.forEach(s => {
        if (s.pv_pattuglia) pattuglieSet.add(s.pv_pattuglia);
    });
    const pattugliaSelect = document.getElementById('elencoFilterPattuglia');
    // Clear and re-populate (keep the "Tutte" option)
    pattugliaSelect.innerHTML = '<option value="">-- Tutte --</option>';
    Array.from(pattuglieSet).sort().forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        pattugliaSelect.appendChild(opt);
    });

    // Add listeners for new UI controls
    const filters = [
        'elencoFilterPattuglia', 'elencoFilterPasso', 'elencoHighlightSfide',
        'elencoSort1', 'elencoSort2', 'elencoSort3'
    ];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el._boundElenco) {
            el._boundElenco = true;
            el.addEventListener('change', () => this.renderElencoTable());
        }
    });

    // Initial Render
    this.renderElencoTable();
};

UI.renderElencoTable = function () {
    const table = document.getElementById('elencoTable');
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // Define columns config
    const columns = [
        { id: 'name', label: 'Cognome Nome' },
        { id: 'pattuglia', label: 'Pattuglia' },
        { id: 'passo', label: 'Passo' },
        { id: 'sfide', label: 'Sfide' },
        { id: 'specialita', label: 'Specialità' },
        { id: 'dob', label: 'Data Nascita' }
    ];

    const activeIds = Array.from(document.querySelectorAll('.col-toggle:checked')).map(c => c.dataset.col);
    const visibleCols = columns.filter(c => c.id === 'name' || activeIds.includes(c.id));

    // 1. Build Header
    let headHtml = '<tr>';
    visibleCols.forEach(col => {
        headHtml += `<th class="px-4 py-2 bg-gray-100 dark:bg-gray-600 select-none">
                        ${col.label}
                     </th>`;
    });
    headHtml += '</tr>';
    thead.innerHTML = headHtml;

    // 2. Prepare Data
    let scouts = [...this.state.scouts];

    // Helper to get sort value
    const getValue = (s, colId) => {
        switch (colId) {
            case 'name': return (s.cognome || '') + ' ' + (s.nome || '');
            case 'pattuglia': return s.pv_pattuglia || '';
            case 'passo': {
                const t2 = s.pv_traccia2_chk || (s.pv_traccia2 && s.pv_traccia2.done);
                const t1 = s.pv_traccia1_chk || (s.pv_traccia1 && s.pv_traccia1.done);
                if (t2) return 3; // III
                if (t1) return 2; // II
                return 1; // I
            }
            case 'sfide': return ''; 
            case 'specialita': return (s.specialita?.length || 0); 
            case 'dob': return s.anag_dob ? new Date(s.anag_dob).getTime() : 0;
            default: return '';
        }
    };

    // Filtri Avanzati
    const filterPattuglia = document.getElementById('elencoFilterPattuglia')?.value;
    const filterPasso = document.getElementById('elencoFilterPasso')?.value;
    
    if (filterPattuglia) {
        scouts = scouts.filter(s => s.pv_pattuglia === filterPattuglia);
    }
    if (filterPasso) {
        const expectedPasso = parseInt(filterPasso);
        scouts = scouts.filter(s => getValue(s, 'passo') === expectedPasso);
    }

    // Ordinamento Multiplo
    const s1 = document.getElementById('elencoSort1')?.value || 'name';
    const s2 = document.getElementById('elencoSort2')?.value;
    const s3 = document.getElementById('elencoSort3')?.value;
    
    scouts.sort((a, b) => {
        const sorts = [s1, s2, s3].filter(Boolean); // Keep only valid selected sorts
        for (const sortCol of sorts) {
            let va = getValue(a, sortCol);
            let vb = getValue(b, sortCol);

            let res = 0;
            if (typeof va === 'string' && typeof vb === 'string') {
                res = va.localeCompare(vb);
            } else {
                res = va - vb;
            }
            
            if (res !== 0) return res; // Se c'è differenza, restituisci
            // Altrimenti prosegui col prossimo criterio
        }
        return 0; // Uguali in tutti i criteri
    });

    // Calcolo frequenze sfide se evidenziate
    const highlightSfide = document.getElementById('elencoHighlightSfide')?.checked;
    const challengeFrequencies = {};

    const getChallengeCode = (s, t, activeTrack) => {
        let code = s[`pv_sfida_${t}_${activeTrack}`];
        if (!code) {
            const oldDirMap = { 'io': 'io', 'al': 're', 'mt': 'im' };
            const codePrefixMap = { 'io': 'IO', 'al': 'AL', 'mt': 'MT' };
            const oldDir = oldDirMap[t];
            
            const intermediateCodeKey = `pv_sfida_${oldDir}_${activeTrack}`;
            const intermediateCode = s[intermediateCodeKey];
            if (intermediateCode && typeof intermediateCode === 'string') {
                code = intermediateCode;
            } else {
                for (let i = 1; i <= 4; i++) {
                    const oldObj = s[`pv_${oldDir}_${activeTrack}${i}`];
                    if (oldObj && oldObj.done) {
                        code = `${activeTrack}-${codePrefixMap[t]}-${i}`;
                        break;
                    }
                }
            }
        }
        return code || null;
    };

    const challengeColors = {};
    if (highlightSfide) {
        const trackForCode = {};
        
        scouts.forEach(s => {
            const activeTrack = getValue(s, 'passo');
            ['io', 'al', 'mt'].forEach(t => {
                const c = getChallengeCode(s, t, activeTrack);
                if (c) {
                    challengeFrequencies[c] = (challengeFrequencies[c] || 0) + 1;
                    trackForCode[c] = activeTrack;
                }
            });
        });

        const palettes = [
            'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100',
            'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100',
            'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100',
            'bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100',
            'bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100',
            'bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100',
            'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100',
            'bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-100',
            'bg-fuchsia-200 dark:bg-fuchsia-800 text-fuchsia-900 dark:text-fuchsia-100',
            'bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100'
        ];
        
        const trackColorIdx = {};
        
        Object.keys(challengeFrequencies).sort().forEach(code => {
            if (challengeFrequencies[code] > 1) {
                const track = trackForCode[code];
                if (trackColorIdx[track] === undefined) {
                    trackColorIdx[track] = 0;
                }
                challengeColors[code] = palettes[trackColorIdx[track] % palettes.length];
                trackColorIdx[track]++;
            }
        });
    }

    // 3. Build Rows
    tbody.innerHTML = '';

    scouts.forEach(s => {
        let rowHtml = `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">`;

        // Always Name
        rowHtml += `<td class="px-4 py-2 font-medium break-words max-w-[150px]">${escapeHtml(s.cognome)} ${escapeHtml(s.nome)}</td>`;

        if (activeIds.includes('pattuglia')) {
            let role = '';
            if (s.pv_vcp_cp === 'CP') role = ' (=)';
            if (s.pv_vcp_cp === 'VCP') role = ' (-)';
            rowHtml += `<td class="px-4 py-2">${escapeHtml(s.pv_pattuglia || '-')}${role}</td>`;
        }

        if (activeIds.includes('passo')) {
            let currentStep = 'I';
            const t2 = s.pv_traccia2_chk || (s.pv_traccia2 && s.pv_traccia2.done);
            const t1 = s.pv_traccia1_chk || (s.pv_traccia1 && s.pv_traccia1.done);
            if (t2) currentStep = 'III';
            else if (t1) currentStep = 'II';
            rowHtml += `<td class="px-4 py-2 text-xs">${currentStep}</td>`;
        }

        if (activeIds.includes('sfide')) {
            let activeTrack = 1;
            const t2 = s.pv_traccia2_chk || (s.pv_traccia2 && s.pv_traccia2.done);
            const t1 = s.pv_traccia1_chk || (s.pv_traccia1 && s.pv_traccia1.done);
            if (t2) activeTrack = 3;
            else if (t1) activeTrack = 2;
            
            const formatSfida = (t) => {
                const code = getChallengeCode(s, t, activeTrack);
                const num = (code || '').split('-').pop() || '-';
                if (highlightSfide && code && challengeFrequencies[code] > 1) {
                    const colorClasses = challengeColors[code] || 'bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100';
                    return `<span class="${colorClasses} px-1 py-0.5 rounded font-bold" title="Sfida condivisa: ${escapeHtml(code)}">${escapeHtml(num)}</span>`;
                }
                return escapeHtml(num);
            };
            
            rowHtml += `<td class="px-4 py-2 font-mono text-xs">I:${formatSfida('io')} A:${formatSfida('al')} M:${formatSfida('mt')}</td>`;
        }

        if (activeIds.includes('specialita')) {
            let text = '-';
            if (Array.isArray(s.specialita) && s.specialita.length > 0) {
                text = s.specialita.map(sp => sp.nome + (sp.data ? ' (C)' : '')).join(', ');
            }
            rowHtml += `<td class="px-4 py-2 text-xs break-words max-w-[200px]">${escapeHtml(text)}</td>`;
        }

        if (activeIds.includes('dob')) {
            const d = s.anag_dob ? toJsDate(s.anag_dob).toLocaleDateString() : '';
            rowHtml += `<td class="px-4 py-2 whitespace-nowrap">${d}</td>`;
        }

        rowHtml += '</tr>';
        tbody.insertAdjacentHTML('beforeend', rowHtml);
    });
};

// --- 3. Sfide PV ---
UI.initSfideTab = function () {
    const filterPattuglia = document.getElementById('sfideFilterPattuglia');
    if (!filterPattuglia._bound) {
        filterPattuglia._bound = true;
        // Popola filtro
        const pattuglie = new Set(this.state.scouts.map(s => s.pv_pattuglia).filter(p => p));
        Array.from(pattuglie).sort().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            filterPattuglia.appendChild(opt);
        });

        filterPattuglia.addEventListener('change', () => this.renderSfideList());
        document.getElementById('printSfideBtn').addEventListener('click', () => this.printList('Sfide PV Scelte', 'sfideContainer'));
        document.getElementById('copySfideBtn').addEventListener('click', () => this.copyList('Sfide PV Scelte', 'sfideContainer'));
        document.getElementById('csvSfideBtn').addEventListener('click', () => this.downloadSfideCSV());
    }
    this.renderSfideList();
};

UI.renderSfideList = function () {
    const container = document.getElementById('sfideContainer');
    const pattuglia = document.getElementById('sfideFilterPattuglia').value;
    let scouts = this.state.scouts;
    if (pattuglia) scouts = scouts.filter(s => s.pv_pattuglia === pattuglia);

    // Mappa le sfide: codice -> { testo, scouts: [] }
    const sfideMap = {};
    
    scouts.forEach(s => {
        const passi = ['1', '2', '3'];
        const dirs = ['io', 'al', 'mt'];
        
        let currentPasso = 1;
        const t2 = s.pv_traccia2_chk || (s.pv_traccia2 && s.pv_traccia2.done);
        const t1 = s.pv_traccia1_chk || (s.pv_traccia1 && s.pv_traccia1.done);
        if (t2) currentPasso = 3;
        else if (t1) currentPasso = 2;
        
        passi.forEach(passo => {
            dirs.forEach(dir => {
                let code = s[`pv_sfida_${dir}_${passo}`];
                
                // Fallback nomenclatura
                if (!code) {
                    const oldDir = {'io': 'io', 'al': 're', 'mt': 'im'}[dir];
                    const intermediateCode = s[`pv_sfida_${oldDir}_${passo}`];
                    if (intermediateCode && typeof intermediateCode === 'string') {
                        code = intermediateCode.replace('-RE-', '-AL-').replace('-IM-', '-MT-');
                    } else {
                        const codePrefixMap = {'io': 'IO', 'al': 'AL', 'mt': 'MT'};
                        for (let i = 1; i <= 4; i++) {
                            const oldObj = s[`pv_${oldDir}_${passo}${i}`];
                            if (oldObj && oldObj.done) {
                                code = `${passo}-${codePrefixMap[dir]}-${i}`;
                                break;
                            }
                        }
                    }
                }
                
                if (code) {
                    if (!sfideMap[code]) {
                        // Cerca il testo nel JSON
                        let text = '';
                        if (this.challengesData && this.challengesData[passo] && this.challengesData[passo][dir.toUpperCase()]) {
                            const found = this.challengesData[passo][dir.toUpperCase()].find(c => c.code === code);
                            if (found) text = found.text;
                        }
                        sfideMap[code] = { text: text, scouts: [] };
                    }
                    
                    let scoutName = `${s.nome} ${s.cognome}`;
                    if (parseInt(passo) < currentPasso) {
                        scoutName += ' (C)';
                    }
                    sfideMap[code].scouts.push(scoutName);
                }
            });
        });
    });

    // Raggruppa per Passo e Direzione
    const byPassoAndDir = {
        '1': { IO: [], AL: [], MT: [] },
        '2': { IO: [], AL: [], MT: [] },
        '3': { IO: [], AL: [], MT: [] }
    };
    
    Object.keys(sfideMap).sort().forEach(code => {
        const parts = code.split('-');
        if (parts.length === 3) {
            const passo = parts[0];
            const dir = parts[1];
            if (byPassoAndDir[passo] && byPassoAndDir[passo][dir]) {
                byPassoAndDir[passo][dir].push({ code, text: sfideMap[code].text, scouts: sfideMap[code].scouts.sort() });
            }
        }
    });

    let html = '';
    const passiRoman = { '1': 'I', '2': 'II', '3': 'III' };
    const dirNames = { 'IO': 'IO', 'AL': 'Gli Altri', 'MT': 'La Mia Traccia' };

    ['1', '2', '3'].forEach(passo => {
        let hasDataPasso = false;
        let htmlPasso = `<div class="mb-8"><h4 class="text-xl font-bold text-green-700 mb-4 border-b-2 border-green-200 pb-1">Passo ${passiRoman[passo]}</h4><div class="space-y-6">`;
        
        ['IO', 'AL', 'MT'].forEach(dir => {
            const sfide = byPassoAndDir[passo][dir];
            if (sfide.length > 0) {
                hasDataPasso = true;
                htmlPasso += `<div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><h5 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">${dirNames[dir]}</h5><ul class="space-y-4">`;
                sfide.forEach(s => {
                    htmlPasso += `
                        <li class="pl-4 border-l-4 border-green-500">
                            <div class="font-bold text-gray-900 dark:text-white">${s.code}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300 italic mb-1">${escapeHtml(s.text || 'Testo non disponibile')}</div>
                            <div class="text-sm font-medium text-blue-600 dark:text-blue-400">Esploratori: ${s.scouts.map(esc => escapeHtml(esc)).join(', ')}</div>
                        </li>
                    `;
                });
                htmlPasso += `</ul></div>`;
            }
        });
        
        htmlPasso += `</div></div>`;
        if (hasDataPasso) html += htmlPasso;
    });

    if (!html) html = '<div class="text-gray-500">Nessuna sfida trovata per la selezione corrente.</div>';
    container.innerHTML = html;
};

// --- 4. Prove PO ---
UI.initProveTab = function () {
    const filterPattuglia = document.getElementById('proveFilterPattuglia');
    if (!filterPattuglia._bound) {
        filterPattuglia._bound = true;
        // Popola filtro
        const pattuglie = new Set(this.state.scouts.map(s => s.pv_pattuglia).filter(p => p));
        Array.from(pattuglie).sort().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            filterPattuglia.appendChild(opt);
        });

        filterPattuglia.addEventListener('change', () => this.renderProveList());
        document.getElementById('printProveBtn').addEventListener('click', () => this.printList('Prove Specialità da Superare', 'proveContainer'));
        document.getElementById('copyProveBtn').addEventListener('click', () => this.copyList('Prove Specialità da Superare', 'proveContainer'));
        document.getElementById('csvProveBtn').addEventListener('click', () => this.downloadProveCSV());
    }
    this.renderProveList();
};

UI.renderProveList = function () {
    const container = document.getElementById('proveContainer');
    const pattuglia = document.getElementById('proveFilterPattuglia').value;
    let scouts = this.state.scouts;
    if (pattuglia) scouts = scouts.filter(s => s.pv_pattuglia === pattuglia);

    if (!this.specialitaListData) {
        container.innerHTML = '<div class="text-red-500">Errore nel caricamento delle specialità.</div>';
        return;
    }

    let html = '';
    
    // Ordine alfabetico
    const sortedSpecs = [...this.specialitaListData].sort((a, b) => a.nome.localeCompare(b.nome));
    
    sortedSpecs.forEach(spec => {
        // Cerca esploratori che hanno questa specialità ma che non l'hanno ottenuta completamente (oppure anche se l'hanno ottenuta, vediamo le prove)
        // Definiamo "chi deve superarla": scout con specialità in corso
        const scoutsWithSpec = scouts.filter(s => {
            return s.specialita && Array.isArray(s.specialita) && s.specialita.some(sp => sp.nome === spec.nome && !sp.ottenuta);
        });

        if (scoutsWithSpec.length > 0) {
            let hasProveDaSuperare = false;
            let htmlSpec = `<div class="mb-8 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div class="bg-yellow-100 dark:bg-yellow-900 px-4 py-3 border-b border-yellow-200 dark:border-yellow-700">
                    <h4 class="text-xl font-bold text-yellow-800 dark:text-yellow-100">${escapeHtml(spec.nome)}</h4>
                </div>
                <div class="p-4 space-y-4">`;

            spec.prove.forEach(prova => {
                const scoutsDaSuperare = [];
                scoutsWithSpec.forEach(s => {
                    const spData = s.specialita.find(sp => sp.nome === spec.nome && !sp.ottenuta);
                    if (spData) {
                        const provaDataKey = `${prova.id}_data`;
                        if (!spData[provaDataKey]) {
                            scoutsDaSuperare.push(`${s.nome} ${s.cognome}`);
                        }
                    }
                });

                if (scoutsDaSuperare.length > 0) {
                    hasProveDaSuperare = true;
                    htmlSpec += `
                        <div class="pl-4 border-l-4 border-yellow-400">
                            <div class="font-bold text-gray-900 dark:text-white">${escapeHtml(prova.nome)}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300 italic mb-1">${escapeHtml(prova.text)}</div>
                            <div class="text-sm font-medium text-red-600 dark:text-red-400">Devono superarla: ${scoutsDaSuperare.sort().map(esc => escapeHtml(esc)).join(', ')}</div>
                        </div>
                    `;
                }
            });

            htmlSpec += `</div></div>`;
            if (hasProveDaSuperare) html += htmlSpec;
        }
    });

    if (!html) html = '<div class="text-gray-500">Nessuna prova PO da superare per la selezione corrente.</div>';
    container.innerHTML = html;
};

// --- Funzioni di utilità per stampa, copia, csv ---
UI.printList = function (title, containerId) {
    const preview = document.getElementById(containerId).innerHTML;
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
      <div class="print-header text-center mb-4">
         <h1 class="text-xl font-bold">Reparto Maori - ${escapeHtml(title)}</h1>
         <p>${new Date().toLocaleDateString()}</p>
      </div>
      ${preview}
    `;
    window.print();
};

UI.copyList = function (title, containerId) {
    const container = document.getElementById(containerId);
    const text = container.innerText;
    navigator.clipboard.writeText(`${title}\n\n${text}`).then(() => {
        this.showToast('Copiato negli appunti');
    }).catch(() => {
        this.showToast('Errore durante la copia', { type: 'error' });
    });
};

UI.downloadSfideCSV = function () {
    const container = document.getElementById('sfideContainer');
    const headers = ["Passo", "Direzione", "Codice", "Testo", "Esploratori"];
    const rows = [];

    const passiDivs = container.querySelectorAll('.mb-8');
    passiDivs.forEach(passoDiv => {
        const h4 = passoDiv.querySelector('h4');
        const passoMatch = h4 ? h4.textContent.match(/Passo (I{1,3})/) : null;
        const passo = passoMatch ? passoMatch[1] : '';
        const dirsDivs = passoDiv.querySelectorAll('.bg-gray-50, .dark\\:bg-gray-700');
        dirsDivs.forEach(dirDiv => {
            const h5 = dirDiv.querySelector('h5');
            const dir = h5 ? h5.textContent.trim() : '';
            const lis = dirDiv.querySelectorAll('li');
            lis.forEach(li => {
                const code = li.children[0]?.textContent?.trim() || '';
                const text = li.children[1]?.textContent?.trim() || '';
                const esploratori = (li.children[2]?.textContent || '').replace(/^Esploratori:\s*/, '').trim();
                rows.push([passo, dir, code, text, esploratori]);
            });
        });
    });

    const pattuglia = document.getElementById('sfideFilterPattuglia')?.value || 'tutte';
    const filename = `sfide_pv_${pattuglia.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    this.downloadCSV(filename, headers, rows);
};

UI.downloadProveCSV = function () {
    const container = document.getElementById('proveContainer');
    const headers = ["Specialita", "Prova", "Testo", "Esploratori Da Superare"];
    const rows = [];

    const specDivs = container.querySelectorAll('.mb-8');
    specDivs.forEach(specDiv => {
        const h4 = specDiv.querySelector('h4');
        const specName = h4 ? h4.textContent.trim() : '';
        const proveDivs = specDiv.querySelectorAll('.border-l-4');
        proveDivs.forEach(provaDiv => {
            const nomeProva = provaDiv.children[0]?.textContent?.trim() || '';
            const testoProva = provaDiv.children[1]?.textContent?.trim() || '';
            const esploratori = (provaDiv.children[2]?.textContent || '').replace(/^Devono superarla:\s*/, '').trim();
            rows.push([specName, nomeProva, testoProva, esploratori]);
        });
    });

    const pattuglia = document.getElementById('proveFilterPattuglia')?.value || 'tutte';
    const filename = `prove_po_${pattuglia.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    this.downloadCSV(filename, headers, rows);
};

// Start
UI.init();
