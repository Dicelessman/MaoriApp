// archivio.js - Logica pagina Archivio

// Aspetta che UI sia disponibile
(function () {
    const init = () => {
        const ui = typeof window !== 'undefined' ? window.UI : (typeof UI !== 'undefined' ? UI : null);
        if (ui) {
            // Sovrascrive renderCurrentPage
            ui.renderCurrentPage = function () {
                this.renderArchive();
            };

            // Estende UI con metodi per archivio
            extendUI(ui);

        } else {
            setTimeout(init, 10);
        }
    };
    init();
})();

function extendUI(UI) {

    UI.renderArchive = async function () {
        const list = this.qs('#archiveList');
        if (!list) return;

        this.showLoadingOverlay('Caricamento archivio...');

        try {
            const archivedScouts = await DATA.loadArchived();

            if (!archivedScouts || archivedScouts.length === 0) {
                list.innerHTML = `
                    <div class="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                        <div class="text-4xl mb-3">🗂️</div>
                        <h3 class="text-lg font-medium text-gray-900">Archivio vuoto</h3>
                        <p class="text-gray-500">Nessun esploratore archiviato trovato.</p>
                    </div>
                `;
                return;
            }

            // Ordina per cognome, nome , 
            archivedScouts.sort((a, b) =>
                (a.cognome || '').localeCompare(b.cognome || '') ||
                (a.nome || '').localeCompare(b.nome || '')
            );

            list.innerHTML = archivedScouts.map(s => `
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                            ${(s.nome || '?')[0]}${(s.cognome || '?')[0]}
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">${s.nome} ${s.cognome}</h4>
                            <div class="text-xs text-gray-500">
                                ${s.pv_pattuglia ? `<span class="mr-2">🦅 ${s.pv_pattuglia}</span>` : ''}
                                ${s.totem ? `<span>🗿 ${s.totem}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <a 
                            href="scout2.html?id=${s.id}"
                            class="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            title="Vedi scheda"
                        >
                            <span>📄</span> Vedi
                        </a>
                        <button 
                            onclick="UI.confirmRestoreScout('${s.id}', '${s.nome.replace(/'/g, "\\'")}', '${s.cognome.replace(/'/g, "\\'")}')"
                            class="px-3 py-1.5 bg-white border border-green-600 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
                            title="Ripristina nei frequentanti"
                        >
                            <span>↩️</span> Ripristina
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Errore caricamento archivio:', error);
            list.innerHTML = `<div class="text-red-500 text-center py-4">Errore durante il caricamento dell'archivio.</div>`;
        } finally {
            this.hideLoadingOverlay();
        }
    };

    UI.confirmRestoreScout = function (id, nome, cognome) {
        if (!confirm(`Sei sicuro di voler ripristinare ${nome} ${cognome} tra gli esploratori attivi?`)) {
            return;
        }
        this.restoreScout(id);
    };

    UI.restoreScout = async function (id) {
        if (!this.currentUser) {
            this.showToast('Devi essere loggato per eseguire questa operazione', { type: 'error' });
            return;
        }

        this.showLoadingOverlay('Ripristino in corso...');
        try {
            await DATA.updateScout(id, { archived: false }, this.currentUser);
            this.showToast('Esploratore ripristinato con successo', { type: 'success' });
            // Ricarica la pagina per aggiornare la lista
            this.renderArchive();
        } catch (error) {
            console.error('Errore ripristino:', error);
            this.showToast('Errore durante il ripristino', { type: 'error' });
        } finally {
            this.hideLoadingOverlay();
        }
    };
}
