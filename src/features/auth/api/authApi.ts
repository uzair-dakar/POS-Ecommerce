import { apiSlice } from '../../../services/api';
import type { Session } from '../authSlice';

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    signIn: builder.mutation<Session, SignInRequest>({
      query: body => ({ url: 'auth/sign-in', method: 'POST', body }),
    }),

    signUp: builder.mutation<Session, SignUpRequest>({
      query: body => ({ url: 'auth/sign-up', method: 'POST', body }),
    }),
  }),
});

export const { useSignInMutation, useSignUpMutation } = authApi;
