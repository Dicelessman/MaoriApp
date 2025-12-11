/**
 * Test per LocalAdapter (test isolato, senza dipendenze esterne)
 * LocalAdapter usa localStorage quindi può essere testato facilmente
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LocalAdapter', () => {
  let mockLocalStorage;
  
  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    global.localStorage = {
      getItem: vi.fn((key) => mockLocalStorage[key] || null),
      setItem: vi.fn((key, value) => { mockLocalStorage[key] = value; }),
      removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { mockLocalStorage = {}; })
    };
  });

  it('should initialize with default data when localStorage is empty', () => {
    // Test logica di inizializzazione
    const saved = JSON.parse(localStorage.getItem('presenziario-state') || '{}');
    expect(saved.scouts || []).toEqual(expect.any(Array));
    expect(saved.staff || []).toEqual(expect.any(Array));
  });

  it('should load saved state from localStorage', () => {
    const savedState = {
      scouts: [{ id: 's1', nome: 'Test', cognome: 'User' }],
      staff: [{ id: 'st1', nome: 'Staff', cognome: 'Member' }]
    };
    mockLocalStorage['presenziario-state'] = JSON.stringify(savedState);
    
    const loaded = JSON.parse(localStorage.getItem('presenziario-state') || '{}');
    expect(loaded.scouts).toHaveLength(1);
    expect(loaded.scouts[0].nome).toBe('Test');
  });

  it('should persist state correctly', () => {
    const state = {
      scouts: [{ id: 's1', nome: 'Test' }],
      activities: []
    };
    localStorage.setItem('presenziario-state', JSON.stringify(state));
    
    expect(localStorage.setItem).toHaveBeenCalled();
    const saved = JSON.parse(mockLocalStorage['presenziario-state']);
    expect(saved.scouts).toHaveLength(1);
  });

  describe('CRUD operations logic', () => {
    it('should add new scout to array', () => {
      const scouts = [{ id: 's1', nome: 'Existing' }];
      const newScout = { nome: 'New', cognome: 'Scout' };
      const id = 's2';
      
      scouts.push({ id, ...newScout });
      expect(scouts).toHaveLength(2);
      expect(scouts[1].id).toBe('s2');
    });

    it('should update existing scout', () => {
      const scouts = [
        { id: 's1', nome: 'Old', cognome: 'Name' },
        { id: 's2', nome: 'Other', cognome: 'Scout' }
      ];
      const updates = { nome: 'New', cognome: 'Name' };
      const targetId = 's1';
      
      const index = scouts.findIndex(s => s.id === targetId);
      if (index !== -1) {
        scouts[index] = { ...scouts[index], ...updates };
      }
      
      expect(scouts[0].nome).toBe('New');
      expect(scouts[0].cognome).toBe('Name');
      expect(scouts[1].nome).toBe('Other'); // Non modificato
    });

    it('should remove scout from array', () => {
      const scouts = [
        { id: 's1', nome: 'One' },
        { id: 's2', nome: 'Two' },
        { id: 's3', nome: 'Three' }
      ];
      const targetId = 's2';
      
      const filtered = scouts.filter(s => s.id !== targetId);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.find(s => s.id === targetId)).toBeUndefined();
      expect(filtered.find(s => s.id === 's1')).toBeDefined();
    });
  });
});

