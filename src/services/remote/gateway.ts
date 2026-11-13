import { env } from '../../config/env';
import type { Session } from '../../features/auth/authSlice';
import type { SignInRequest, SignUpRequest } from '../../features/auth/api/authApi';
import type { CreateReservationRequest } from '../../features/reservations/api/reservationsApi';
import type {
  ChainDetail,
  MerchantDetail,
  MerchantId,
  MerchantKind,
  Reservation,
  ReservationAvailability,
} from '../../types';
import type { ApiRequest } from '../api/baseQuery';
import type {
  ConfirmReservationDto,
  HoldReservationDto,
  LoginDto,
  ReservationAvailabilityDto,
  StoreDto,
  StoresWithProductsDto,
} from './dto';
import { REMOTE } from './endpoints';
import { RemoteError, remoteRequest, unwrap } from './httpClient';
import { mapLoginToSession } from './mappers/auth';
import { mapStoreToMerchantDetail } from './mappers/catalogue';
import { decodeMerchantId } from './mappers/common';
import { mapAvailability, seatingNameFor } from './mappers/reservations';
import {
  buildHomeFeed,
  chainIdFor,
  mapStoresToChains,
  mapStoresToMerchants,
  kindForBusinessType,
} from './mappers/stores';

/**
 * The anti-corruption layer between the app and the POS backend.
 *
 * Screens and RTK Query endpoints ask for app-level resources — "home/feed",
 * "merchants/:id" — exactly as they do against the mock transport. This file
 * is the only place that knows those resources are assembled from RPC-style
 * POST endpoints with the backend's own field names. Swapping or reshaping an
 * endpoint therefore never reaches a screen.
 */

export type GatewayContext = {
  /** Bearer token for the signed-in customer, if there is one. */
  token: string | null;
};

type Handler = (request: ApiRequest, context: GatewayContext) => Promise<unknown>;

const PRODUCT_PAGE_SIZE = 50;

/** Where the user is ordering to. Replaced by the address book when it lands. */
const DEFAULT_DELIVER_TO = 'Valletta';

const param = (request: ApiRequest, key: string): string | undefined => {
  const value = (request.params as Record<string, unknown> | undefined)?.[key];
  return value === undefined || value === null ? undefined : String(value);
};

/* ----------------------------- store lookups ---------------------------- */

async function fetchStores(
  businessTypeID: number,
  context: GatewayContext,
): Promise<readonly StoreDto[]> {
  const envelope = await remoteRequest<StoreDto[]>({
    endpoint: REMOTE.stores.withOutlets,
    body: { businessTypeID },
    token: context.token,
  });

  const stores = unwrap(envelope, 'Unable to load stores right now.');
  return Array.isArray(stores) ? stores : [];
}

async function fetchStoreCatalogue(
  merchantId: MerchantId,
  page: number,
  context: GatewayContext,
): Promise<StoresWithProductsDto['stores']> {
  const { businessTypeID, storeRequestID, outletID } = decodeMerchantId(merchantId);

  const envelope = await remoteRequest<StoresWithProductsDto>({
    endpoint: REMOTE.stores.withProducts,
    body: {
      businessTypeID,
      storeRequestID,
      outletID,
      currentPageNo: 1,
      pageSize: 20,
      productPageNo: page,
      productPageSize: PRODUCT_PAGE_SIZE,
    },
    token: context.token,
  });

  return unwrap(envelope, 'Unable to load this menu.').stores ?? [];
}

/** The outlet a reservation call needs its store's siteHash for. */
async function fetchSiteHash(
  merchantId: MerchantId,
  context: GatewayContext,
): Promise<{ siteHash: string; outletID: number; merchantName: string }> {
  const { storeRequestID, outletID } = decodeMerchantId(merchantId);
  const stores = await fetchStoreCatalogue(merchantId, 1, context);
  const store = stores?.[0];

  if (!store?.siteHash) {
    throw new RemoteError(502, 'This restaurant is not accepting bookings right now.');
  }

  return {
    siteHash: store.siteHash,
    outletID: outletID || Number(store.outlets?.[0]?.storeOutletID ?? 0),
    merchantName: store.storeName ?? `Store ${storeRequestID}`,
  };
}

/* -------------------------------- handlers ------------------------------ */

const handlers: Record<string, Handler> = {
  'home/feed': async (_request, context) => {
    const stores = await fetchStores(env.allBusinessTypes, context);
    return buildHomeFeed(stores, DEFAULT_DELIVER_TO);
  },

  merchants: async (request, context) => {
    const kind = param(request, 'kind') as MerchantKind | undefined;

    // A category id IS the backend's businessTypeID, so a tapped tile narrows
    // the request itself rather than being filtered client-side.
    const businessTypeID = Number(param(request, 'categoryId') ?? env.allBusinessTypes) || env.allBusinessTypes;
    const stores = await fetchStores(businessTypeID, context);
    const merchants = mapStoresToMerchants(stores);

    // With a category asked for, the server has already narrowed it; the kind
    // filter would only re-apply the same rule.
    return businessTypeID === env.allBusinessTypes && kind
      ? merchants.filter(merchant => merchant.kind === kind)
      : merchants;
  },

  chains: async (_request, context) => {
    const stores = await fetchStores(env.allBusinessTypes, context);
    return mapStoresToChains(stores);
  },

  'chains/:id': async (request, context) => {
    const id = param(request, 'id');
    const stores = await fetchStores(env.allBusinessTypes, context);
    const store = stores.find(candidate => chainIdFor(candidate) === id);

    if (!store) {
      throw new RemoteError(404, 'Brand not found.');
    }

    const { mapStoreToChainDetail } = await import('./mappers/stores');
    return mapStoreToChainDetail(store) satisfies ChainDetail;
  },

  'merchants/:id': async (request, context) => {
    const merchantId = param(request, 'id') as MerchantId;
    const { outletID } = decodeMerchantId(merchantId);
    const stores = await fetchStoreCatalogue(merchantId, 1, context);
    const store = stores?.[0];

    if (!store) {
      throw new RemoteError(404, 'This place is no longer available.');
    }

    return mapStoreToMerchantDetail(store, merchantId, outletID) satisfies MerchantDetail;
  },

  'products/:id': async (request, context) => {
    const { decodeProductId } = await import('./mappers/common');
    const { mapProduct } = await import('./mappers/catalogue');
    const { merchantId, productID } = decodeProductId(String(param(request, 'id')));

    const stores = await fetchStoreCatalogue(merchantId as MerchantId, 1, context);
    const product = (stores?.[0]?.productsByCategory ?? [])
      .flatMap(category => category.products ?? [])
      .find(candidate => String(candidate.productID) === productID);

    if (!product) {
      throw new RemoteError(404, 'This item is no longer on the menu.');
    }

    // The catalogue endpoint carries no option groups, so the product sheet
    // renders without them until the backend exposes modifiers.
    return { product: mapProduct(product, merchantId as MerchantId), optionGroups: [] };
  },

  search: async (request, context) => {
    const query = (param(request, 'q') ?? '').trim().toLowerCase();
    if (!query) {
      return { merchants: [], products: [] };
    }

    const stores = await fetchStores(env.allBusinessTypes, context);
    const merchants = mapStoresToMerchants(stores).filter(merchant =>
      `${merchant.name} ${merchant.tagline}`.toLowerCase().includes(query),
    );

    // Product search needs a per-outlet catalogue call, so it stays out of
    // the first pass rather than fanning out one request per store.
    return { merchants: merchants.slice(0, 12), products: [] };
  },

  'auth/sign-in': async request => {
    const { email, password } = request.body as SignInRequest;

    const envelope = await remoteRequest<LoginDto>({
      endpoint: REMOTE.auth.login,
      body: { loginName: email.trim(), userPassword: password, pageID: 'string', appKey: 0 },
      token: null,
    });

    const login = unwrap(envelope, 'Invalid email or password. Please try again.');

    if (!login.token) {
      throw new RemoteError(401, 'Signed in, but no session was returned. Please try again.');
    }

    return mapLoginToSession(login, email) satisfies Session;
  },

  'auth/sign-up': async request => {
    const { firstName, lastName, email, phone, password } = request.body as SignUpRequest;

    await remoteRequest<unknown>({
      endpoint: REMOTE.auth.register,
      body: {
        FirstName: firstName.trim(),
        LastName: lastName.trim(),
        EmailAddress: email.trim(),
        PhoneNumber: phone.trim(),
        Password: password,
        isAgreementAccepted: true,
      },
      token: null,
    });

    // Registration does not return a session, so the new account is signed in
    // with the credentials just created — one round trip, no stored password.
    return handlers['auth/sign-in']({ url: 'auth/sign-in', body: { email, password } }, { token: null });
  },

  'reservations/availability': async (request, context) => {
    const merchantId = param(request, 'merchantId') as MerchantId;
    const date = param(request, 'date') ?? '';
    const { siteHash, outletID, merchantName } = await fetchSiteHash(merchantId, context);

    const envelope = await remoteRequest<ReservationAvailabilityDto>({
      endpoint: REMOTE.reservations.availability,
      body: { siteHash, outletID, date, time: '', guests: 2 },
      token: context.token,
    });

    return mapAvailability(
      unwrap(envelope, 'Could not check availability. Please try again.'),
      merchantId,
      merchantName,
    ) satisfies ReservationAvailability;
  },

  'reservations/create': async (request, context) => {
    const body = request.body as CreateReservationRequest;
    const { siteHash, outletID, merchantName } = await fetchSiteHash(body.merchantId, context);

    // The backend books in two steps: hold the table, then confirm it with
    // the guest's details. The app models one action, so both happen here.
    const held = await remoteRequest<HoldReservationDto>({
      endpoint: REMOTE.reservations.hold,
      body: {
        siteHash,
        outletID,
        date: body.date,
        time: body.time,
        guests: body.guests,
        seatingOption: seatingNameFor(body.seating),
        replaceReservationCode: '',
      },
      token: context.token,
    });

    const reservationCode = unwrap(held, 'That table was just taken. Try another time.')
      .reservationCode;

    if (!reservationCode) {
      throw new RemoteError(409, 'That table was just taken. Try another time.');
    }

    const confirmed = await remoteRequest<ConfirmReservationDto>({
      endpoint: REMOTE.reservations.confirm,
      body: {
        siteHash,
        reservationCode,
        guestName: body.fullName,
        guestPhone: body.phone,
        occasion: body.occasion ?? '',
        specialRequest: body.specialRequest ?? '',
        optInRestaurant: false,
        optInPlatform: false,
        optInSms: body.wantsTextUpdates,
      },
      token: context.token,
    });

    const result = unwrap(confirmed, 'Could not confirm your booking. Please try again.');

    return {
      reference: result.reservationNumber ?? result.reservationCode ?? reservationCode,
      merchantName,
      merchantImageUrl: '',
      date: body.date,
      time: body.time,
      guests: body.guests,
      seating: body.seating,
    } satisfies Reservation;
  },
};

/**
 * Resolves an app-level request to its handler, turning the id segment of a
 * templated route into a param — the same contract the mock transport uses,
 * so a request behaves identically against either.
 */
export function resolveGatewayHandler(
  request: ApiRequest,
): { handler: Handler; request: ApiRequest } | undefined {
  const direct = handlers[request.url];
  if (direct) {
    return { handler: direct, request };
  }

  const segments = request.url.split('/');
  if (segments.length === 2) {
    const templated = handlers[`${segments[0]}/:id`];
    if (templated) {
      return {
        handler: templated,
        request: { ...request, params: { ...request.params, id: segments[1] } },
      };
    }
  }

  return undefined;
}

export const kindOfBusinessType = kindForBusinessType;
