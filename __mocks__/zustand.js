// Mock for zustand/middleware
const mockZustand = {
  persist: (config) => (set, get, api) => {
    const store = config(set, get, api);
    return {
      ...store,
      // Mock the persistence methods
      setItem: jest.fn(() => Promise.resolve(null)),
      getItem: jest.fn(() => Promise.resolve(null)),
      removeItem: jest.fn(() => Promise.resolve(null)),
    };
  },
  createJSONStorage: jest.fn(() => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve(null)),
  })),
};

module.exports = mockZustand;

