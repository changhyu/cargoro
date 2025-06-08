// Mock implementation for next/headers - Server and Client compatible
export const headers = typeof window !== 'undefined' ? () => new Map() : () => new Map();

export const cookies =
  typeof window !== 'undefined'
    ? () => ({
        get: () => undefined,
        set: () => {},
        delete: () => {},
      })
    : () => ({
        get: () => undefined,
        set: () => {},
        delete: () => {},
      });

export const draftMode =
  typeof window !== 'undefined' ? () => ({ isEnabled: false }) : () => ({ isEnabled: false });

// CommonJS exports for server compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    headers,
    cookies,
    draftMode,
  };
}
