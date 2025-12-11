// Vitest configuration per testing
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.js', '**/*.spec.js'],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.js',
        '**/*.spec.js',
        '**/config.js',
        '**/build-config.js'
      ]
    }
  }
});

