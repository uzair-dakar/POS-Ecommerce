import { env } from '../../config/env';
import type { ApiError } from '../api/baseQuery';
import type { RemoteEndpoint } from './endpoints';

/**
 * The one place an HTTP request is made.
 *
 * It owns the base URL choice, the tenant headers, the bearer token, the
 * timeout and the error shape. Mappers above it see parsed JSON or a thrown
 * RemoteError — never a Response.
 */

export class RemoteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'RemoteError';
    this.status = status;
  }
}

export const toApiError = (error: unknown): ApiError =>
  error instanceof RemoteError
    ? { status: error.status, message: error.message }
    : {
        status: 0,
        message:
          error instanceof Error && error.message
            ? error.message
            : 'Network unavailable. Check your connection and try again.',
      };

/** The backend answers 200 with a code; only this one means success. */
const SUCCESS_CODES = new Set(['GENERAL_SUCCESS', 'LOGIN_DONE', 'SUCCESS']);

export type RemoteEnvelope<T> = {
  data?: T;
  msgCode?: string;
  msgDescription?: string;
};

const buildHeaders = (method: string, token: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: '*/*',
    'Content-Type': 'application/json',
    'X-BEHAVIOUR-TYPE': method,
    'X-PAGE-MARK': '5',
  };

  if (env.store.hash) {
    headers['X-STORE-HASH'] = env.store.hash;
  }
  if (env.store.authSha) {
    headers['X1Auth-SHA'] = env.store.authSha;
  }
  if (env.store.authShb) {
    headers['X2Auth-SHB'] = env.store.authShb;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export type RemoteCall = {
  endpoint: RemoteEndpoint;
  /** Appended to the endpoint path — ids and query strings only. */
  suffix?: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  token: string | null;
};

export async function remoteRequest<T>({
  endpoint,
  suffix = '',
  method = 'POST',
  body,
  token,
}: RemoteCall): Promise<RemoteEnvelope<T>> {
  const baseUrl = endpoint.version === 'v1' ? env.api.v1BaseUrl : env.api.baseUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.api.timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint.path}${suffix}`, {
      method,
      headers: buildHeaders(method, token),
      body: body == null ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RemoteError(408, 'The request took too long. Please try again.');
    }
    throw error;
  }
  clearTimeout(timeout);

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as RemoteEnvelope<T>) : {};

  if (!response.ok) {
    throw new RemoteError(
      response.status,
      payload.msgDescription ?? 'Something went wrong. Please try again.',
    );
  }

  return payload;
}

/**
 * Unwraps an envelope, turning the backend's in-band failure codes into the
 * same RemoteError a transport failure produces — so callers branch once.
 */
export function unwrap<T>(envelope: RemoteEnvelope<T>, fallbackMessage: string): T {
  if (envelope.msgCode && !SUCCESS_CODES.has(envelope.msgCode)) {
    throw new RemoteError(400, envelope.msgDescription ?? fallbackMessage);
  }
  if (envelope.data === undefined || envelope.data === null) {
    throw new RemoteError(502, fallbackMessage);
  }
  return envelope.data;
}
