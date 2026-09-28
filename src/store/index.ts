import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { apiSlice } from '../services/api';
import { basketReducer } from '../features/basket/basketSlice';

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  basket: basketReducer,
});

/**
 * Only client-owned state is persisted. Server data lives in the RTK Query
 * cache and is re-fetched on launch, so it can never go stale on disk.
 */
const persistedReducer = persistReducer(
  {
    key: 'buzztill-root',
    version: 1,
    storage: AsyncStorage,
    whitelist: ['basket'],
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});

/** Enables refetchOnReconnect / refetchOnFocus behaviour. */
setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
