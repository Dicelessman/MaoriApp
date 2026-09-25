/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Configure root to current directory
    root: './',

    // Public directory for static assets
    publicDir: 'public',

    // Build configuration
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                presenze: resolve(__dirname, 'presenze.html'),
                storicoPresenze: resolve(__dirname, 'storico-presenze.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                calendario: resolve(__dirname, 'calendario.html'),
                esploratori: resolve(__dirname, 'esploratori.html'),
                staff: resolve(__dirname, 'staff.html'),
                auditLogs: resolve(__dirname, 'audit-logs.html'),
                statistiche: resolve(__dirname, 'statistiche.html'),
                liste: resolve(__dirname, 'liste.html'),
                pagamenti: resolve(__dirname, 'pagamenti.html'),
                documenti: resolve(__dirname, 'documenti.html'),
                preferenze: resolve(__dirname, 'preferenze.html'),
                attivita: resolve(__dirname, 'attivita.html'),
                scout2: resolve(__dirname, 'scout2.html'),
                archivio: resolve(__dirname, 'archivio.html'),
                scadenze: resolve(__dirname, 'scadenze.html'),
                scorte: resolve(__dirname, 'scorte.html'),
                preventivo: resolve(__dirname, 'preventivo.html'),
                gara: resolve(__dirname, 'gara.html')
            }
        }
    },

    // Test configuration
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs}'],
    },
});

