/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    // Configure root to current directory
    root: './',

    // Public directory for static assets
    publicDir: './',

    // Build configuration
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },

    // Test configuration
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs}'],
    },
});
