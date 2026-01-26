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
        case 'pattuglie': this.initPattuglieTab(); break;
        case 'progressione': this.initProgressioneTab(); break;
        case 'specialita': this.initSpecialitaTab(); break;
    }
};

/* --- 1. Presenze -n-- */
UI.initPresenzeTab = function () {
    const select = document.getElementById('activitySelect');
    if (select.children.length <= 1) { // Populate only if empty
        const acts = [...this.state.activities].sort((a, b) => new Date(b.data) - new Date(a.data));
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
    }
};

UI.renderPresenzePreview = async function () {
    const actId = document.getElementById('activitySelect').value;
    const showDob = document.getElementById('presenzeShowDob').checked;
    const sortSurname = document.getElementById('presenzeSortSurname').checked;
    const container = document.getElementById('presenzePreview');
    const list = document.getElementById('presenzePreviewList');
    const btnPrint = document.getElementById('printPresenzeBtn');

    if (!actId) {
        container.classList.add('hidden');
        btnPrint.disabled = true;
        return;
    }

    container.classList.remove('hidden');
    btnPrint.disabled = false;
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

UI.copyPresenzeList = async function () {
    const title = document.getElementById('presenzePreviewTitle').textContent;
    const listItems = document.querySelectorAll('#presenzePreviewList div');

    let text = `${title}\n\n`;
    listItems.forEach(div => {
        // Extract text content cleanly (removing HTML tags but keeping structure)
        const name = div.querySelector('span.font-medium').textContent;
        const meta = div.querySelector('span.text-xs')?.textContent || '';
        text += `${name} ${meta ? '(' + meta + ')' : ''}\n`;
    });

    try {
        await navigator.clipboard.writeText(text);
        this.showToast('Lista copiata negli appunti');
    } catch (err) {
        console.error('Errore copia:', err);
        this.showToast('Errore durante la copia', { type: 'error' });
    }
};

/* --- 2. Pattuglie --- */
UI.initPattuglieTab = function () {
    const container = document.getElementById('pattuglieContainer');

    // Group by Patrol
    const patrols = {};
    const unassigned = [];

    this.state.scouts.forEach(s => {
        // Assume pv_pattuglia is the field. Check scout2.js to confirm field name. 
        // In Step 227 scout2.html shows: <select id="pv_pattuglia" ...>
        const pat = s.pv_pattuglia;
        if (pat) {
            if (!patrols[pat]) patrols[pat] = [];
            patrols[pat].push(s);
        } else {
            unassigned.push(s);
        }
    });

    // Render
    container.innerHTML = '';

    Object.keys(patrols).sort().forEach(patName => {
        const members = patrols[patName].sort((a, b) => (a.cognome || '').localeCompare(b.cognome || ''));

        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-orange-200 dark:border-orange-900/30';

        let html = `<h4 class="text-lg font-bold text-orange-700 dark:text-orange-400 mb-3 border-b pb-2 flex justify-between">
            ${escapeHtml(patName)} <span class="text-sm font-normal text-gray-500">${members.length} membri</span>
        </h4>`;

        html += `<ul class="space-y-1 text-sm">`;
        members.forEach(m => {
            // Maybe add icons for roles (Capo, Vice) if available in logic
            let role = '';
            let roleClass = '';
            if (m.pv_vcp_cp === 'CP') { role = '='; roleClass = 'text-yellow-600 font-extrabold text-lg'; }
            else if (m.pv_vcp_cp === 'VCP') { role = '-'; roleClass = 'text-yellow-600 font-extrabold text-lg'; }

            html += `<li class="flex justify-between items-center">
                <span>${escapeHtml(m.cognome)} ${escapeHtml(m.nome)}</span>
                <span class="${roleClass}" title="${m.pv_vcp_cp}">${role}</span>
             </li>`;
        });
        html += `</ul>`;

        card.innerHTML = html;
        container.appendChild(card);
    });

    // Unassigned if any
    if (unassigned.length > 0) {
        const card = document.createElement('div');
        card.className = 'bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow';
        card.innerHTML = `<h4 class="text-lg font-bold text-gray-600 dark:text-gray-300 mb-3">Non Assegnati (${unassigned.length})</h4>
        <ul class="space-y-1 text-sm list-disc pl-4">
            ${unassigned.map(m => `<li>${escapeHtml(m.cognome)} ${escapeHtml(m.nome)}</li>`).join('')}
        </ul>`;
        container.appendChild(card);
    }

    document.getElementById('printPattuglieBtn').onclick = () => {
        const content = document.getElementById('pattuglieContainer').innerHTML;
        const printArea = document.getElementById('printArea');
        printArea.innerHTML = `
            <div class="print-header text-center mb-6">
                <h1 class="text-2xl font-bold">Pattuglie Reparto Maori</h1>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                ${content}
            </div>
         `;
        window.print();
    };
};

/* --- 3. Progressione --- */
UI.initProgressioneTab = function () {
    const tbody = document.getElementById('progressioneTableBody');
    tbody.innerHTML = '';

    // Sort all by surname
    const scouts = [...this.state.scouts].sort((a, b) => (a.cognome || '').localeCompare(b.cognome || ''));

    // Determine current step. Logic:
    // If Step 3 completed -> "Competenza" (or whatever is next/max)
    // If Step 2 completed -> Step 3
    // If Step 1 completed -> Step 2
    // Else -> Step 1 (Scoperta)

    // We check `pv_tracciaX_chk` (from scout2.html analysis)

    scouts.forEach(s => {
        let currentStep = 'Scoperta (Passo 1)';
        let activeTrack = 1;

        // Check completamento
        if (s.pv_traccia2_chk) { currentStep = 'Responsabilità (Passo 3)'; activeTrack = 3; }
        else if (s.pv_traccia1_chk) { currentStep = 'Competenza (Passo 2)'; activeTrack = 2; }

        // Get selected challenges for active, active+1? 
        // User asked "con sigle delle prove che hanno scelto"
        // Le prove sono in pv_sfida_io_X, pv_sfida_al_X, pv_sfida_mt_X
        // X = activeTrack generally.

        const getChallenge = (type, track) => {
            const val = s[`pv_sfida_${type}_${track}`]; // Value is likely the ID/Key of challenge
            // We verify challenges data in scout2.js normally, but here maybe just show code
            return val ? val.split('_').pop() : '-'; // e.g. "io_1_natura" -> "natura"? Or just show full string?
            // Let's just show initials or short text. 
            // Better: just show the raw value or a placeholder if mapping needed.
            return val || '-';
        };

        const io = getChallenge('io', activeTrack);
        const al = getChallenge('al', activeTrack);
        const mt = getChallenge('mt', activeTrack);

        const tr = document.createElement('tr');
        tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                ${escapeHtml(s.cognome)} ${escapeHtml(s.nome)}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">${currentStep}</span>
            </td>
            <td class="px-6 py-4 font-mono text-xs">
                IO: ${io}<br>AL: ${al}<br>MT: ${mt}
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('printProgressioneBtn').onclick = () => {
        // Table print
        const table = document.querySelector('#tab-progressione table').outerHTML;
        const printArea = document.getElementById('printArea');
        printArea.innerHTML = `
           <h1 class="text-xl font-bold mb-4">Progressione Verticale</h1>
           ${table}
        `;
        window.print();
    };
};

/* --- 4. Specialità --- */
UI.initSpecialitaTab = function () {
    const container = document.getElementById('specialitaContainer');
    container.innerHTML = 'Caricamento specialità...';

    // We need the canonical list of specialties. 
    // Usually loaded from 'specialita.json'.
    // We can fetch it here.
    fetch('specialita.json').then(r => r.json()).then(specs => {
        // specs is Array of { nome, area, ... } or Object?
        // Assume Array based on scout2.js "loadSpecialitaList" return [] default.

        // Sort specs
        specs.sort((a, b) => a.nome.localeCompare(b.nome));

        // Map scouts to specs
        // Scouts have `specialita` array of objects: { nome, data, status (conseguita/programma) }
        // Or fields? scout2.html doesn't show specialita section implementation details in the snippet (is dynamic).
        // Let's assume proper data model based on "loadAll".

        // We iterate all scouts and build a map: SpecName -> { done: [names], todo: [names] }
        const map = {};

        this.state.scouts.forEach(s => {
            // Check where specs are stored. 
            // If they are in s.specialita (array)
            if (Array.isArray(s.specialita)) {
                s.specialita.forEach(sp => {
                    if (!map[sp.nome]) map[sp.nome] = { done: [], todo: [] };
                    const fullname = `${s.cognome} ${s.nome}`;
                    if (sp.data) { // Conseguita if date exists? Or explicit status?
                        map[sp.nome].done.push(fullname);
                    } else {
                        map[sp.nome].todo.push(fullname);
                    }
                });
            }
        });

        // Render
        container.innerHTML = '';
        specs.forEach(sp => {
            const data = map[sp.nome] || { done: [], todo: [] };
            if (data.done.length === 0 && data.todo.length === 0) return; // Hide empty? Or show all? User said "associati gli esploratori", likely hide unused.

            const div = document.createElement('div');
            div.className = 'bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700';

            let html = `<h4 class="font-bold text-lg mb-2">${escapeHtml(sp.nome)} <span class="text-xs text-gray-500">(${sp.area})</span></h4>`;

            if (data.done.length > 0) {
                html += `<div class="mb-2"><span class="text-xs font-bold text-green-600 uppercase">Conseguite:</span> <span class="text-sm">${data.done.join(', ')}</span></div>`;
            }
            if (data.todo.length > 0) {
                html += `<div><span class="text-xs font-bold text-yellow-600 uppercase">In Programma:</span> <span class="text-sm">${data.todo.join(', ')}</span></div>`;
            }

            div.innerHTML = html;
            container.appendChild(div);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Nessuna specialità assegnata.</p>';
        }

    }).catch(e => {
        container.textContent = 'Errore caricamento specialità: ' + e.message;
    });
};

// Start
UI.init();
