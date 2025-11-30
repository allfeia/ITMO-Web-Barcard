import '@testing-library/jest-dom'
function createMemoryStorage() {
  const store = new Map()
  return {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)) },
    removeItem: (k) => { store.delete(String(k)) },
    clear: () => { store.clear() },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size },
  }
}
if (!globalThis.sessionStorage) {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createMemoryStorage(),
    writable: false,
    configurable: true,
  })
}
if (globalThis.window && !window.sessionStorage) {
  Object.defineProperty(window, 'sessionStorage', {
    value: globalThis.sessionStorage,
    writable: false,
    configurable: true,
  })
}
