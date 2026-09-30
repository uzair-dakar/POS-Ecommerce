import { apiSlice } from '../../../services/api';
import type {
  MerchantId,
  Reservation,
  ReservationAvailability,
  SeatingKind,
} from '../../../types';

export type CreateReservationRequest = {
  merchantId: MerchantId;
  date: string;
  time: string;
  guests: number;
  seating: SeatingKind;
  fullName: string;
  phone: string;
  occasion?: string;
  specialRequest?: string;
  wantsTextUpdates: boolean;
};

export const reservationsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAvailability: builder.query<ReservationAvailability, { merchantId: MerchantId; date: string }>({
      query: params => ({ url: 'reservations/availability', params }),
    }),

    createReservation: builder.mutation<Reservation, CreateReservationRequest>({
      query: body => ({ url: 'reservations/create', method: 'POST', body }),
    }),
  }),
});

export const { useGetAvailabilityQuery, useCreateReservationMutation } = reservationsApi;
