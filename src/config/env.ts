/**
 * Build-time configuration — the only place a URL, a credential or the data
 * source is named. Nothing else in the app may hard-code them.
 */

/** 'mock' resolves every request from local fixtures; 'live' hits the backend. */
export type DataSource = 'mock' | 'live';

export const env = {
  dataSource: 'live' as DataSource,

  api: {
    /** Base host for the legacy (non-versioned) endpoints. */
    baseUrl: 'https://orderapi.dakarpos.com/api',
    /** Base host for the v1 endpoints — most of the storefront lives here. */
    v1BaseUrl: 'https://orderapi.dakarpos.com/api/v1',
    /** Requests are aborted after this, so a dead network fails a screen fast. */
    timeoutMs: 20000,
  },

  /**
   * Per-tenant headers the backend requires on every call. Paste the values
   * the web app ships in its own API client; they identify the store, not a
   * user, so they are configuration rather than a session secret.
   */
  store: {
    hash: 'ya4qiSVBBQo+KIObs6LsQrYzNtCiwk2N',
    authSha: 'N6nC6lddGKKq7q7+HIqbRQ^^',
    authShb: '8ca58187-c02c-4bb1-85bc-8da95a14a2b2',
  },

  /** 0 asks the backend for every business type at once. */
  allBusinessTypes: 0,

  /** Simulated latency in mock mode, so loading states stay honest. */
  mockLatencyMs: 450,
} as const;

export const isLive = env.dataSource === 'live';
