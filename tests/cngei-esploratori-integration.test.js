import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Integrazione UI Sincronizzazione CNGEI (esploratori.html & esploratori.js)', () => {
  let htmlContent;

  beforeEach(() => {
    htmlContent = fs.readFileSync(path.resolve(__dirname, '../esploratori.html'), 'utf8');
  });

  it('esploratori.html dovrebbe contenere il pulsante per avviare la sincronizzazione CNGEI', () => {
    expect(htmlContent).toContain('id="openCngeiSyncBtn"');
    expect(htmlContent).toContain('Sincronizza CNGEI');
  });

  it('esploratori.html dovrebbe includere il modale cngeiSyncModal con le schede previste', () => {
    expect(htmlContent).toContain('id="cngeiSyncModal"');
    expect(htmlContent).toContain('id="tabBtnToImport"');
    expect(htmlContent).toContain('id="tabBtnToUpdate"');
    expect(htmlContent).toContain('id="tabBtnSynced"');
    expect(htmlContent).toContain('id="cngeiSearchInput"');
    expect(htmlContent).toContain('id="cngeiSelectAllBtn"');
    expect(htmlContent).toContain('id="cngeiDeselectAllBtn"');
    expect(htmlContent).toContain('id="cngeiConfirmSyncBtn"');
  });

  it('esploratori.html dovrebbe mostrare l\'avviso specifico relativo agli esploratori non frequentanti', () => {
    expect(htmlContent).toContain('id="cngeiImportNotice"');
    expect(htmlContent).toContain('Attenzione alle frequenze');
    expect(htmlContent).toContain('fine anno');
  });
});
