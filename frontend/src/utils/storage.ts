export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Error setting localStorage', e);
    }
  },
  remove: (key: string): void => {
    window.localStorage.removeItem(key);
  },
  clear: (): void => {
    window.localStorage.clear();
  }
};
