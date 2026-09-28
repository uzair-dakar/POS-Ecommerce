/**
 * Single source of truth for build-time configuration. Wire this to
 * react-native-config / .env files when the real backend exists.
 */
export const env = {
  apiBaseUrl: 'https://api.buzztill.example/v1',
  /** Flip to false once the backend is live — nothing else has to change. */
  useMocks: true,
  /** Simulated latency so loading states are exercised during development. */
  mockLatencyMs: 450,
} as const;
