import '@testing-library/jest-dom';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - making available globally for jsdom tests
globalThis.ResizeObserver = ResizeObserver;
