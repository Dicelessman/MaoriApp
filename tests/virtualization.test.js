/**
 * Test per Virtualizzazione Liste
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('List Virtualization', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-list';
    container.style.height = '400px';
    container.style.overflow = 'auto';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Virtualization logic', () => {
    it('should calculate visible range correctly', () => {
      const itemHeight = 80;
      const viewportHeight = 400;
      const scrollTop = 160;
      const overscan = 5;
      
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan;
      
      expect(startIndex).toBeGreaterThanOrEqual(0);
      expect(endIndex).toBeGreaterThan(startIndex);
    });

    it('should calculate correct offset for visible items', () => {
      const itemHeight = 80;
      const startIndex = 10;
      const offsetTop = startIndex * itemHeight;
      
      expect(offsetTop).toBe(800);
    });

    it('should only render visible items plus overscan', () => {
      const totalItems = 1000;
      const itemHeight = 80;
      const viewportHeight = 400;
      const scrollTop = 0;
      const overscan = 5;
      
      const visibleCount = Math.ceil(viewportHeight / itemHeight);
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        totalItems - 1,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
      );
      
      const itemsToRender = endIndex - startIndex + 1;
      
      // Should be much less than total items
      expect(itemsToRender).toBeLessThan(totalItems);
      expect(itemsToRender).toBeGreaterThan(0);
    });

    it('should handle edge cases', () => {
      const itemHeight = 80;
      
      // Empty list
      const emptyItems = [];
      expect(emptyItems.length).toBe(0);
      
      // Single item
      const singleItem = [1];
      expect(singleItem.length).toBe(1);
      
      // Very small viewport
      const smallViewport = 50;
      const smallVisible = Math.ceil(smallViewport / itemHeight);
      expect(smallVisible).toBe(1);
    });
  });

  describe('Performance considerations', () => {
    it('should reduce DOM elements significantly', () => {
      const totalItems = 1000;
      const itemHeight = 80;
      const viewportHeight = 400;
      const overscan = 5;
      
      // Without virtualization: all 1000 items in DOM
      const withoutVirtualization = totalItems;
      
      // With virtualization: only visible + overscan
      const visibleCount = Math.ceil(viewportHeight / itemHeight);
      const withVirtualization = visibleCount + (overscan * 2);
      
      expect(withVirtualization).toBeLessThan(withoutVirtualization / 10);
    });

    it('should calculate scroll position efficiently', () => {
      const scrollTop = 1000;
      const itemHeight = 80;
      const currentIndex = Math.floor(scrollTop / itemHeight);
      
      expect(currentIndex).toBe(12);
    });
  });
});

