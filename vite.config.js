/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const cngeiToken = env.CNGEI_API_TOKEN || process.env.CNGEI_API_TOKEN || 'g1yFQNKt4IF-hRfDJHh7_lCU7mqDDdkNdxlcbtykYg4';

    return {
        // Configure root to current directory
        root: './',

        // Public directory for static assets
        publicDir: 'public',

        // Development server proxy for secure CNGEI API access
        server: {
            proxy: {
                '/api/cngei': {
                    target: 'https://api.cngei.it',
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path.replace(/^\/api\/cngei/, ''),
                    headers: {
                        'X-Api-Token': cngeiToken
                    }
                }
            }
        },

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
    };
});

