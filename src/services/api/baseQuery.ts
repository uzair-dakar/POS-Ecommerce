import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '../../config/env';
import { resolveMockHandler } from '../mock/handlers';

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

const httpBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: headers => {
    headers.set('accept', 'application/json');
    return headers;
  },
});

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

/**
 * One swappable transport for the whole app.
 *
 * With `env.useMocks` on it resolves from local fixtures after a short delay,
 * so every screen exercises its real loading and error states. Turning the
 * flag off routes the identical requests at the HTTP backend — no endpoint,
 * component or hook needs to change.
 */
export const appBaseQuery: BaseQueryFn<ApiRequest, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  if (env.useMocks) {
    await delay(env.mockLatencyMs);
    const resolved = resolveMockHandler(args);
    if (!resolved) {
      return { error: { status: 404, message: `No mock handler for "${args.url}"` } };
    }
    // Handlers receive the whole request so they can branch on the body of a
    // POST exactly as the real endpoint will.
    return resolved.handler(resolved.request);
  }

  const result = await httpBaseQuery(
    { url: args.url, method: args.method ?? 'GET', body: args.body, params: args.params },
    api,
    extraOptions,
  );

  if (result.error) {
    return {
      error: {
        status: typeof result.error.status === 'number' ? result.error.status : 500,
        message:
          (result.error.data as { message?: string } | undefined)?.message ??
          'Something went wrong. Please try again.',
      },
    };
  }

  return { data: result.data };
};
