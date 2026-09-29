import { describe, it, expect, vi } from 'vitest';
import {
  matchProgressioneType,
  collectPendingProgressioni,
  sendProgressioneToCngei
} from '../js/services/cngei-progressioni.js';

describe('CNGEI Progressioni Sync (Passo 5)', () => {
  const mockTypes = [
    { id: 'type-sp-guida', name: 'Guida', branca: 'E', kind: 'PO' },
    { id: 'type-sp-fotografo', name: 'Fotografo', branca: 'E', kind: 'PO' },
    { id: 'type-traccia-1', name: 'Traccia 1', branca: 'E', kind: 'PV' },
    { id: 'type-traccia-2', name: 'Traccia 2', branca: 'E', kind: 'PV' },
    { id: 'type-traccia-3', name: 'Traccia 3', branca: 'E', kind: 'PV' }
  ];

  it('matchProgressioneType dovrebbe trovare il tipo corrispondente per nome specialità o traccia', () => {
    const spMatch = matchProgressioneType('Guida', mockTypes);
    expect(spMatch?.id).toBe('type-sp-guida');

    const t1Match = matchProgressioneType('Traccia 1', mockTypes);
    expect(t1Match?.id).toBe('type-traccia-1');

    const notFound = matchProgressioneType('Inesistente', mockTypes);
    expect(notFound).toBeNull();
  });

  it('collectPendingProgressioni dovrebbe identificare specialità e tracce conseguite non ancora inviate', () => {
    const scout = {
      id: 's1',
      nome: 'Nora',
      idCngei: 'uuid-nora',
      specialita: [
        { nome: 'Guida', data: '2026-05-10', ottenuta: true }, // da inviare
        { nome: 'Fotografo', data: '2026-01-15', ottenuta: true, idProgressioneCngei: 'already-sent' } // già inviata
      ],
      pv_traccia1: { done: true, data: '2025-11-20' }, // da inviare
      pv_traccia2: { done: false }
    };

    const pending = collectPendingProgressioni(scout, mockTypes);

    expect(pending).toHaveLength(2);
    expect(pending[0].name).toBe('Guida');
    expect(pending[0].typeId).toBe('type-sp-guida');
    expect(pending[0].obtainedAt).toBe('2026-05-10');

    expect(pending[1].name).toBe('Traccia 1');
    expect(pending[1].typeId).toBe('type-traccia-1');
    expect(pending[1].obtainedAt).toBe('2025-11-20');
  });

  it('sendProgressioneToCngei dovrebbe invocare la chiamata createProgressione del service', async () => {
    const mockService = {
      createProgressione: vi.fn().mockResolvedValue({ id: 'created-prog-id' })
    };

    const res = await sendProgressioneToCngei('uuid-nora', 'type-sp-guida', '2026-05-10', mockService);

    expect(mockService.createProgressione).toHaveBeenCalledWith('uuid-nora', 'type-sp-guida', '2026-05-10');
    expect(res).toBeDefined();
  });
});
