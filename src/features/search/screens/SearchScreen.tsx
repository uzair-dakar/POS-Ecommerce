import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../../components/layout';
import {
  AppImage,
  AppText,
  Chip,
  Icon,
  IconButton,
  MetaRow,
  SearchBar,
  Skeleton,
} from '../../../components/ui';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { colors, radii, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';
import { formatDeliveryFee, formatDeliveryWindow, formatPrice } from '../../../utils';
import type { Merchant, Product } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useSearchQuery } from '../../merchants/api/merchantsApi';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SUGGESTIONS = ['Burger', 'Pizza', 'Sushi', 'Coffee', 'Bananas', 'Coca-Cola'] as const;

export function SearchScreen() {
  const navigation = useNavigation<Navigation>();
  const [term, setTerm] = useState('');

  // Typing fires a request per keystroke otherwise; 300ms is long enough to
  // collapse a burst of them and short enough to still feel instant.
  const debouncedTerm = useDebouncedValue(term, 300);
  const trimmed = debouncedTerm.trim();

  const { data, isFetching } = useSearchQuery(trimmed, { skip: trimmed.length === 0 });

  const openMerchant = useCallback(
    (merchant: Merchant) => navigation.navigate('Merchant', { merchantId: merchant.id }),
    [navigation],
  );

  const openProduct = useCallback(
    (product: Product) =>
      navigation.navigate('Product', {
        merchantId: product.merchantId,
        productId: product.id,
      }),
    [navigation],
  );

  const hasResults = (data?.merchants.length ?? 0) + (data?.products.length ?? 0) > 0;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton
          name="arrowLeft"
          accessibilityLabel="Go back"
          variant="outline"
          size={40}
          onPress={navigation.goBack}
        />
        <SearchBar
          placeholder="Search restaurants, dishes, shops..."
          value={term}
          onChangeText={setTerm}
          autoFocus
          style={styles.field}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {trimmed.length === 0 ? (
          <View style={styles.block}>
            <AppText variant="eyebrow" color="textMuted">
              Try searching for
            </AppText>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map(suggestion => (
                <Chip key={suggestion} label={suggestion} onPress={() => setTerm(suggestion)} />
              ))}
            </View>
          </View>
        ) : isFetching && !data ? (
          <View style={styles.block}>
            <Skeleton height={86} radius={14} />
            <Skeleton height={86} radius={14} />
            <Skeleton height={86} radius={14} />
          </View>
        ) : !hasResults ? (
          <View style={styles.empty}>
            <AppText variant="h2" align="center">
              No results for "{trimmed}"
            </AppText>
            <AppText variant="body" color="textMuted" align="center">
              Try a different word, or browse the categories on the home screen.
            </AppText>
          </View>
        ) : (
          <>
            {data!.merchants.length > 0 ? (
              <View style={styles.block}>
                <AppText variant="eyebrow" color="textMuted">
                  Stores
                </AppText>
                {data!.merchants.map(merchant => (
                  <Pressable
                    key={merchant.id}
                    accessibilityRole="button"
                    accessibilityLabel={merchant.name}
                    onPress={() => openMerchant(merchant)}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <AppImage source={{ uri: merchant.imageUrl }} style={styles.thumb} />
                    <View style={styles.copy}>
                      <AppText variant="bodyStrong" numberOfLines={1}>
                        {merchant.name}
                      </AppText>
                      <MetaRow
                        items={[
                          { icon: 'bike', label: formatDeliveryFee(merchant.deliveryFee) },
                          {
                            icon: 'clock',
                            label: formatDeliveryWindow(
                              merchant.deliveryMinMinutes,
                              merchant.deliveryMaxMinutes,
                            ),
                          },
                          { icon: 'star', label: merchant.rating.toFixed(1) },
                        ]}
                      />
                    </View>
                    <Icon name="chevronRight" size={15} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {data!.products.length > 0 ? (
              <View style={styles.block}>
                <AppText variant="eyebrow" color="textMuted">
                  Items
                </AppText>
                {data!.products.map(product => (
                  <Pressable
                    key={product.id}
                    accessibilityRole="button"
                    accessibilityLabel={product.name}
                    onPress={() => openProduct(product)}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <AppImage source={{ uri: product.imageUrl }} style={styles.thumb} />
                    <View style={styles.copy}>
                      <AppText variant="bodyStrong" numberOfLines={1}>
                        {product.name}
                      </AppText>
                      <AppText variant="caption" color="textMuted" numberOfLines={1}>
                        {product.description}
                      </AppText>
                    </View>
                    <AppText variant="price">{formatPrice(product.price)}</AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingVertical: spacing.md,
  },
  field: { flex: 1 },
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge, gap: spacing.xl },
  block: { gap: spacing.sm },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    ...surfaces.card,
  },
  thumb: { width: 58, height: 58, borderRadius: radii.md },
  copy: { flex: 1, gap: spacing.xxs },
  empty: { paddingTop: spacing.huge, gap: spacing.sm },
  pressed: { opacity: 0.9 },
});
