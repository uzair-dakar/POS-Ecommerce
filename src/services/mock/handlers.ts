import type {
  ChainDetail,
  MerchantId,
  OrderId,
  HomeFeed,
  Merchant,
  MerchantDetail,
  MerchantKind,
  Order,
  Reservation,
  ReservationAvailability,
} from '../../types';
import type { Session } from '../../features/auth/authSlice';
import type { SignInRequest, SignUpRequest } from '../../features/auth/api/authApi';
import type { ApiError, ApiRequest } from '../api/baseQuery';
import { MOCK_HOME_FEED } from './data';
import {
  ALL_LISTED_MERCHANTS,
  ALL_PRODUCTS,
  MOCK_CHAINS,
  MOCK_CHAIN_DETAILS,
  MOCK_MERCHANT_DETAILS,
  optionGroupsForProduct,
} from './menus';
import { MOCK_ORDERS, MOCK_RESERVATION_AVAILABILITY } from './orders';

/** Same shape RTK Query expects back from a base query. */
export type MockResult = { data: unknown } | { error: ApiError };

export type MockHandler = (request: ApiRequest) => MockResult;

const ok = (data: unknown): MockResult => ({ data });
const fail = (status: number, message: string): MockResult => ({ error: { status, message } });
const notFound = (what: string) => fail(404, `${what} not found`);

/**
 * Orders placed during this session.
 *
 * The mock layer has to remember them: the confirmation and tracking screens
 * fetch the order back by id straight after placing it, exactly as they will
 * against the real backend.
 */
const placedOrders: Order[] = [];

const allOrders = (): readonly Order[] => [...placedOrders, ...MOCK_ORDERS];

const session = (user: Session['user']): Session => ({
  accessToken: `mock-token-${user.id}`,
  user,
});

/**
 * Mirrors the future REST surface: one entry per endpoint path. Handlers get
 * the full request, so a POST can branch on its body the way the real
 * endpoint will — including the failure cases screens have to handle.
 *
 * Paths with an id are matched by the leading segment, so "merchants/m_x"
 * lands on the "merchants/:id" entry.
 */
export const mockHandlers: Record<string, MockHandler> = {
  'home/feed': () => ok(MOCK_HOME_FEED satisfies HomeFeed),

  merchants: ({ params }) => {
    const kind = (params as { kind?: MerchantKind } | undefined)?.kind;
    return ok(
      (kind
        ? ALL_LISTED_MERCHANTS.filter(m => m.kind === kind)
        : ALL_LISTED_MERCHANTS) satisfies readonly Merchant[],
    );
  },

  chains: () => ok(MOCK_CHAINS),

  /** Backs the search screen: one request, both kinds of result. */
  search: ({ params }) => {
    const query = String((params as { q?: string } | undefined)?.q ?? '')
      .trim()
      .toLowerCase();

    if (query.length === 0) {
      return ok({ merchants: [], products: [] });
    }

    const matches = (text: string) => text.toLowerCase().includes(query);

    return ok({
      merchants: ALL_LISTED_MERCHANTS.filter(
        m => matches(m.name) || matches(m.tagline) || m.tags.some(matches),
      ).slice(0, 12),
      products: ALL_PRODUCTS.filter(p => matches(p.name) || matches(p.description)).slice(0, 20),
    });
  },

  'merchants/:id': ({ params }) => {
    const id = (params as { id: string }).id;
    const detail = MOCK_MERCHANT_DETAILS[id];
    return detail ? ok(detail satisfies MerchantDetail) : notFound('Merchant');
  },

  'chains/:id': ({ params }) => {
    const id = (params as { id: string }).id;
    const detail = MOCK_CHAIN_DETAILS[id];
    return detail ? ok(detail satisfies ChainDetail) : notFound('Brand');
  },

  'products/:id': ({ params }) => {
    const id = (params as { id: string }).id;
    const found = ALL_PRODUCTS.find(p => p.id === id);
    if (!found) {
      return notFound('Product');
    }
    return ok({ product: found, optionGroups: optionGroupsForProduct(found.id) });
  },

  orders: () => ok(allOrders()),

  'orders/:id': ({ params }) => {
    const id = (params as { id: string }).id;
    const found = allOrders().find(o => o.id === id);
    return found ? ok(found satisfies Order) : notFound('Order');
  },

  'orders/place': ({ body }) => {
    const { merchantId, merchantName, merchantImageUrl, lines } = body as {
      merchantId: MerchantId;
      merchantName: string;
      merchantImageUrl: string;
      lines: readonly { productId: string; name: string; imageUrl: string; unitPrice: number; quantity: number }[];
    };

    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const sequence = placedOrders.length + 1;

    const order: Order = {
      ...MOCK_ORDERS[0],
      id: `o_new_${sequence}` as OrderId,
      reference: `ORD-49${String(sequence).padStart(3, '0')}`,
      merchantId,
      merchantName,
      merchantImageUrl,
      status: 'placed',
      etaMinutes: 35,
      placedOn: new Date().toISOString().slice(0, 10),
      lines: lines.map(line => ({
        productId: line.productId as Order['lines'][number]['productId'],
        name: line.name,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        total: line.unitPrice * line.quantity,
      })),
      timeline: [{ status: 'placed', at: '—' }],
      subtotal,
      deliveryFee: 0,
      vat: Math.round(subtotal * 0.18),
      total: subtotal,
    };

    placedOrders.unshift(order);
    return ok(order);
  },

  'reservations/availability': () =>
    ok(MOCK_RESERVATION_AVAILABILITY satisfies ReservationAvailability),

  'reservations/create': ({ body }) => {
    const { date, time, guests, seating } = body as Omit<
      Reservation,
      'reference' | 'merchantName' | 'merchantImageUrl'
    >;
    return ok({
      reference: 'RES-K8Q2MX7A',
      merchantName: MOCK_RESERVATION_AVAILABILITY.merchantName,
      merchantImageUrl: MOCK_MERCHANT_DETAILS.m_burger_oclock.merchant.imageUrl,
      date,
      time,
      guests,
      seating,
    } satisfies Reservation);
  },

  'auth/sign-in': ({ body }) => {
    const { email, password } = body as SignInRequest;

    // One canned rejection so the screen's error path is exercised in dev.
    if (password === 'wrong') {
      return fail(401, 'That email and password do not match.');
    }

    return ok(session({ id: 'u_1', firstName: 'Sara', lastName: 'Borg', email }));
  },

  'auth/sign-up': ({ body }) => {
    const { firstName, lastName, email, phone } = body as SignUpRequest;

    if (email === 'taken@buzztill.com') {
      return fail(409, 'An account with that email already exists.');
    }

    return ok(session({ id: 'u_new', firstName, lastName, email, phone }));
  },
};

/**
 * Resolves a concrete path to its handler, turning the id segment of a
 * templated route into a param. Keeps endpoint definitions reading like real
 * URLs ("merchants/m_x") instead of carrying ad-hoc lookup keys.
 */
export function resolveMockHandler(
  request: ApiRequest,
): { handler: MockHandler; request: ApiRequest } | undefined {
  const direct = mockHandlers[request.url];
  if (direct) {
    return { handler: direct, request };
  }

  const segments = request.url.split('/');
  if (segments.length === 2) {
    const templated = mockHandlers[`${segments[0]}/:id`];
    if (templated) {
      return {
        handler: templated,
        request: { ...request, params: { ...request.params, id: segments[1] } },
      };
    }
  }

  return undefined;
}
