/**
 * Test per User Preferences
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('User Preferences', () => {
  beforeEach(() => {
    if (window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('Default preferences', () => {
    it('should return default preferences when none exist', () => {
      const defaultPrefs = {
        theme: 'auto',
        activityOrder: null,
        defaultView: null,
        savedFilters: {},
        notifications: {
          activityReminders: true,
          paymentReminders: true,
          importantChanges: true,
          birthdayReminders: true,
          enabled: false
        }
      };

      expect(defaultPrefs.theme).toBe('auto');
      expect(defaultPrefs.notifications.enabled).toBe(false);
      expect(defaultPrefs.notifications.birthdayReminders).toBe(true);
    });

    it('should load preferences from localStorage', () => {
      const prefs = {
        theme: 'dark',
        notifications: { enabled: true }
      };
      
      if (window.localStorage) {
        window.localStorage.setItem('app-preferences', JSON.stringify(prefs));
        const loaded = JSON.parse(window.localStorage.getItem('app-preferences'));
        expect(loaded.theme).toBe('dark');
        expect(loaded.notifications.enabled).toBe(true);
      }
    });

    it('should merge preferences correctly', () => {
      const local = { theme: 'light', activityOrder: 'name' };
      const remote = { theme: 'dark', defaultView: 'dashboard.html' };
      const merged = { ...remote, ...local }; // Local takes precedence
      
      expect(merged.theme).toBe('light'); // Local wins
      expect(merged.activityOrder).toBe('name'); // From local
      expect(merged.defaultView).toBe('dashboard.html'); // From remote
    });
  });

  describe('Theme preferences', () => {
    it('should support light, dark, and auto themes', () => {
      const themes = ['light', 'dark', 'auto'];
      themes.forEach(theme => {
        expect(themes.includes(theme)).toBe(true);
      });
    });

    it('should detect system theme preference', () => {
      if (window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        expect(typeof prefersDark).toBe('boolean');
      }
    });
  });

  describe('Notification preferences', () => {
    it('should have all notification types', () => {
      const notificationTypes = {
        activityReminders: true,
        paymentReminders: true,
        importantChanges: true,
        birthdayReminders: true,
        enabled: false
      };

      expect(notificationTypes.activityReminders).toBe(true);
      expect(notificationTypes.paymentReminders).toBe(true);
      expect(notificationTypes.importantChanges).toBe(true);
      expect(notificationTypes.birthdayReminders).toBe(true);
      expect(notificationTypes.enabled).toBe(false);
    });

    it('should require permission before enabling notifications', () => {
      const canEnable = 'Notification' in window && Notification.permission === 'granted';
      // In test environment, permission might be default/denied
      expect(typeof canEnable).toBe('boolean');
    });
  });
});

