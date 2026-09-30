import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { SplashScreen } from './features/splash/SplashScreen';
import { RootNavigator } from './navigation/RootNavigator';
import { persistor, store } from './store';

/**
 * Provider order matters: gesture handler and safe-area must wrap everything
 * (the splash needs insets too), the store must wrap the gate, and the
 * navigator must sit inside both so screens can read state on first paint.
 *
 * PersistGate shows the splash until the stored session and basket are back
 * from disk — that is why a returning user never sees onboarding flash by.
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<SplashScreen />} persistor={persistor}>
            <RootNavigator />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
