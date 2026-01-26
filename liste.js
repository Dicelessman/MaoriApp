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
    }
};

/* --- 1. Presenze -n-- */
UI.initPresenzeTab = function () {
    const select = document.getElementById('activitySelect');
    if (select.children.length <= 1) { // Populate only if empty
        const acts = [...this.state.activities].sort((a, b) => toJsDate(a.data) - toJsDate(b.data));
        acts.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            const dateStr = toJsDate(a.data).toLocaleDateString('it-IT');
            opt.textContent = `${dateStr} - ${a.tipo} ${a.descrizione || ''}`;
            select.appendChild(opt);
        });

        // Listeners
        select.addEventListener('change', () => this.renderPresenzePreview());
        document.getElementById('presenzeShowDob').addEventListener('change', () => this.renderPresenzePreview());
        document.getElementById('presenzeSortSurname').addEventListener('change', () => this.renderPresenzePreview());

        document.getElementById('printPresenzeBtn').addEventListener('click', () => this.printPresenzeList());
        document.getElementById('copyPresenzeBtn').addEventListener('click', () => this.copyPresenzeList());
        document.getElementById('csvPresenzeBtn').addEventListener('click', () => this.downloadPresenzeCSV());
    }
};

UI.renderPresenzePreview = async function () {
    const actId = document.getElementById('activitySelect').value;
    const showDob = document.getElementById('presenzeShowDob').checked;
    const sortSurname = document.getElementById('presenzeSortSurname').checked;
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
        if (sortSurname) return (a.cognome || '').localeCompare(b.cognome || '');
        return (a.nome || '').localeCompare(b.nome || '');
    });

    // Render
    const act = this.state.activities.find(a => a.id === actId);
    document.getElementById('presenzePreviewTitle').textContent = `Presenti: ${act.tipo} del ${toJsDate(act.data).toLocaleDateString()}`;

    list.innerHTML = '';
    scouts.forEach((s, idx) => {
        const div = document.createElement('div');
        div.className = 'p-2 border-b border-gray-100 flex justify-between items-center';
        div.dataset.name = `${s.nome} ${s.cognome}`; // Store for CSV
        div.dataset.dob = s.anag_dob ? toYyyyMmDd(s.anag_dob) : '';

        let name = sortSurname ? `${s.cognome} ${s.nome}` : `${s.nome} ${s.cognome}`;
        let meta = '';
        if (showDob && s.anag_dob) {
            const date = new Date(s.anag_dob);
            meta = `<span class="text-xs text-gray-500">${date.toLocaleDateString()}</span>`;
        }

        div.innerHTML = `<span class="font-medium">${idx + 1}. ${escapeHtml(name)}</span> ${meta}`;
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
        // Extract text content cleanly (removing HTML tags but keeping structure)
        const name = div.querySelector('span.font-medium').textContent;
        const meta = div.querySelector('span.text-xs')?.textContent || '';
        text += `${name} ${meta ? '(' + meta + ')' : ''}\n`;
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

UI.downloadPresenzeCSV = function () {
    const actId = document.getElementById('activitySelect').value;
    if (!actId) return;

    // Re-fetch filtered data (or parse from DOM to respect current sort/filter)
    // Parsing DOM is wysiwyg.
    const listItems = document.querySelectorAll('#presenzePreviewList div');
    const showDob = document.getElementById('presenzeShowDob').checked;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nome;Cognome" + (showDob ? ";Data Nascita" : "") + "\n"; // Header

    listItems.forEach(div => {
        // We stored raw data in dataset above for cleaner access
        // But wait, renderPresenzePreview above didn't store raw data in dataset in my previous edit.
        // Let's rely on the state + filtering again to be safe and cleaner?
        // Actually, let's update renderPresenzePreview to store dataset or just re-calculate here.
        // Re-calculating is safer.
    });

    // Better strategy: Re-query state using same logic
    const presences = this.state.presences.filter(p => p.attivitaId === actId && p.stato === 'Presente');
    const presentScoutIds = new Set(presences.map(p => p.esploratoreId));
    let scouts = this.state.scouts.filter(s => presentScoutIds.has(s.id));
    const sortSurname = document.getElementById('presenzeSortSurname').checked;

    scouts.sort((a, b) => {
        if (sortSurname) return (a.cognome || '').localeCompare(b.cognome || '');
        return (a.nome || '').localeCompare(b.nome || '');
    });

    scouts.forEach(s => {
        let row = `"${s.nome}";"${s.cognome}"`;
        if (showDob) {
            const dob = s.anag_dob ? toYyyyMmDd(s.anag_dob) : '';
            row += `;"${dob}"`;
        }
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const actName = (this.state.activities.find(a => a.id === actId)?.tipo || 'presenze').replace(/[^a-z0-9]/gi, '_');
    link.setAttribute("download", `${actName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        let csv = "Cognome;Nome";
        if (activeCols.includes('pattuglia')) csv += ";Pattuglia";
        if (activeCols.includes('passo')) csv += ";Passo";
        if (activeCols.includes('sfide')) csv += ";Sfide";
        if (activeCols.includes('specialita')) csv += ";Specialita";
        if (activeCols.includes('dob')) csv += ";Data Nascita";
        csv += "\n";

        const rows = document.querySelectorAll('#elencoTable tbody tr');
        rows.forEach(r => {
            csv += Array.from(r.querySelectorAll('td')).map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`).join(';') + "\n";
        });

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + csv));
        link.setAttribute("download", `elenco_maori_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Initial Render
    this.elencoSort = { col: 'name', dir: 'asc' }; // Default sort
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
        const isSorted = this.elencoSort.col === col.id;
        const icon = isSorted ? (this.elencoSort.dir === 'asc' ? ' 🔼' : ' 🔽') : '';
        // Add style for pointer
        headHtml += `<th class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none" 
                        data-sort="${col.id}">
                        ${col.label}${icon}
                     </th>`;
    });
    headHtml += '</tr>';
    thead.innerHTML = headHtml;

    // Attach sort listeners
    thead.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (this.elencoSort.col === col) {
                this.elencoSort.dir = this.elencoSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                this.elencoSort.col = col;
                this.elencoSort.dir = 'asc';
            }
            this.renderElencoTable();
        });
    });

    // 2. Prepare Data
    let scouts = [...this.state.scouts];

    // Helper to get sort value
    const getValue = (s, colId) => {
        switch (colId) {
            case 'name': return (s.cognome || '') + ' ' + (s.nome || '');
            case 'pattuglia': return s.pv_pattuglia || '';
            case 'passo':
                if (s.pv_traccia2_chk) return 3; // Responsabilità
                if (s.pv_traccia1_chk) return 2; // Competenza
                return 1; // Scoperta
            case 'sfide': return ''; // Not really sortable easily, maybe by count? or string
            case 'specialita': return (s.specialita?.length || 0); // Sort by count?
            case 'dob': return s.anag_dob ? new Date(s.anag_dob).getTime() : 0;
            default: return '';
        }
    };

    // Sort
    scouts.sort((a, b) => {
        let va = getValue(a, this.elencoSort.col);
        let vb = getValue(b, this.elencoSort.col);

        // Handle strings
        if (typeof va === 'string' && typeof vb === 'string') {
            return this.elencoSort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        // Handle numbers
        return this.elencoSort.dir === 'asc' ? va - vb : vb - va;
    });

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
            let currentStep = 'Scoperta';
            if (s.pv_traccia2_chk) currentStep = 'Responsabilità';
            else if (s.pv_traccia1_chk) currentStep = 'Competenza';
            rowHtml += `<td class="px-4 py-2 text-xs">${currentStep}</td>`;
        }

        if (activeIds.includes('sfide')) {
            let activeTrack = 1;
            if (s.pv_traccia2_chk) activeTrack = 3;
            else if (s.pv_traccia1_chk) activeTrack = 2;
            const getC = (t) => (s[`pv_sfida_${t}_${activeTrack}`] || '').split('_').pop() || '-';
            rowHtml += `<td class="px-4 py-2 font-mono text-xs">I:${getC('io')} A:${getC('al')} M:${getC('mt')}</td>`;
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

// Start
UI.init();
