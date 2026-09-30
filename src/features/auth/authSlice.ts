import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type Session = {
  accessToken: string;
  user: User;
};

export type AuthState = {
  session: Session | null;
  /** Set when the user chose "Browse as guest" — they can shop but not order. */
  isGuest: boolean;
};

const initialState: AuthState = {
  session: null,
  isGuest: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted: (state, action: PayloadAction<Session>) => {
      state.session = action.payload;
      state.isGuest = false;
    },
    guestSessionStarted: state => {
      state.session = null;
      state.isGuest = true;
    },
    signedOut: state => {
      state.session = null;
      state.isGuest = false;
    },
  },
});

export const { sessionStarted, guestSessionStarted, signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;

/* ------------------------------ selectors ------------------------------ */

type RootSlice = { auth: AuthState };

export const selectSession = (state: RootSlice) => state.auth.session;
export const selectUser = (state: RootSlice) => state.auth.session?.user ?? null;
export const selectIsAuthenticated = (state: RootSlice) =>
  state.auth.session !== null || state.auth.isGuest;
export const selectIsGuest = (state: RootSlice) => state.auth.isGuest;
