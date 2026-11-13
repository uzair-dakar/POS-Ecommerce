import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { env } from '../../config/env';
import { resolveMockHandler } from '../mock/handlers';
import { resolveGatewayHandler } from '../remote/gateway';
import { toApiError } from '../remote/httpClient';

export type ApiError = {
  status: number;
  message: string;
};

export type ApiRequest = {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, unknown>;
};

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

/** The signed-in customer's token, read straight off the auth slice. */
const tokenFrom = (state: unknown): string | null =>
  (state as { auth?: { session?: { accessToken?: string } } })?.auth?.session?.accessToken ?? null;

/**
 * One swappable transport for the whole app.
 *
 * `env.dataSource` decides where a request is answered:
 *
 * - `mock` resolves it from local fixtures after a short delay, so every
 *   screen exercises its real loading and error states.
 * - `live` hands it to the gateway, which assembles it from the POS backend's
 *   endpoints and maps the response into the app's domain types.
 *
 * Both sides answer the same app-level URLs ("merchants/:id"), so no endpoint,
 * hook or component changes when the flag moves.
 */
export const appBaseQuery: BaseQueryFn<ApiRequest, unknown, ApiError> = async (args, api) => {
  if (env.dataSource === 'mock') {
    await delay(env.mockLatencyMs);
    const resolved = resolveMockHandler(args);
    if (!resolved) {
      return { error: { status: 404, message: `No mock handler for "${args.url}"` } };
    }
    return resolved.handler(resolved.request);
  }

  const resolved = resolveGatewayHandler(args);
  if (!resolved) {
    return {
      error: {
        status: 501,
        message: `"${args.url}" is not wired to the backend yet.`,
      },
    };
  }

  try {
    const data = await resolved.handler(resolved.request, { token: tokenFrom(api.getState()) });
    return { data };
  } catch (error) {
    return { error: toApiError(error) };
  }
};
