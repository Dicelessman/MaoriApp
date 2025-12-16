/**
 * Shared.js - Entry point for the application compatibility layer
 * @module shared
 */

import { DATA } from './js/data/data-facade.js';
import { UI } from './js/ui/ui.js';

// Re-export globally for legacy HTML files
window.DATA = DATA;
window.UI = UI;

document.addEventListener('DOMContentLoaded', () => {
  if (UI && UI.init) {
    UI.init();
  }
});

console.log('Shared.js loaded (Modularized version)');
