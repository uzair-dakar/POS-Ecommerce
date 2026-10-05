import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../../components/layout';
import { AppText, Button, Logo } from '../../../components/ui';
import { spacing } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { basketCleared, selectBasket } from '../../basket/basketSlice';
import type { RootStackParamList } from '../../../navigation/types';
import { usePlaceOrderMutation } from '../api/ordersApi';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Submits the basket and hands off to the confirmation screen.
 *
 * There is no UI to fill in — the basket screen already collected address,
 * timing and payment — so this exists to own the one risky moment: the order
 * must be placed exactly once, and the basket cleared only after it succeeds.
 */
export function CheckoutScreen() {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const basket = useAppSelector(selectBasket);
  const [placeOrder, { isLoading, isError }] = usePlaceOrderMutation();

  const hasSubmitted = useRef(false);

  const submit = useCallback(async () => {
    if (hasSubmitted.current || !basket.merchantId || !basket.merchantName) {
      return;
    }
    hasSubmitted.current = true;

    try {
      const order = await placeOrder({
        merchantId: basket.merchantId,
        merchantName: basket.merchantName,
        merchantImageUrl: basket.merchantImageUrl ?? '',
        lines: basket.lines,
      }).unwrap();

      dispatch(basketCleared());
      navigation.replace('OrderConfirmation', { orderId: order.id });
    } catch {
      // Let the user retry rather than stranding them on a dead screen.
      hasSubmitted.current = false;
    }
  }, [basket, placeOrder, dispatch, navigation]);

  useEffect(() => {
    submit();
  }, [submit]);

  return (
    <Screen background="primaryDark" statusBarStyle="light-content" edges={['top', 'bottom']}>
      <View style={styles.centered}>
        <Logo size={84} elevated />

        <AppText variant="h2" color="textInverse" align="center">
          {isError ? 'We could not place your order' : 'Placing your order…'}
        </AppText>
        <AppText variant="body" color="textInverse" align="center" style={styles.dim}>
          {isError
            ? 'Nothing has been charged. Please try again.'
            : 'Hold tight, this only takes a moment.'}
        </AppText>

        {isError ? (
          <Button label="Try again" loading={isLoading} fullWidth={false} onPress={submit} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  dim: { opacity: 0.75 },
});
