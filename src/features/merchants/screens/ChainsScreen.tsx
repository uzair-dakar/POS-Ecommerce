import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QueryBoundary, Screen, ScreenHeader } from '../../../components/layout';
import { AppImage, AppText, Icon, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';
import { pluralise } from '../../../utils';
import type { Chain } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetChainsQuery } from '../api/merchantsApi';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Every multi-location brand. Reached from the home feed's "See all". */
export function ChainsScreen() {
  const navigation = useNavigation<Navigation>();
  const query = useGetChainsQuery();

  const openChain = useCallback(
    (chain: Chain) => navigation.navigate('Chain', { chainId: chain.id }),
    [navigation],
  );

  const renderChain = useCallback<ListRenderItem<Chain>>(
    ({ item }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.name}
        onPress={() => openChain(item)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <AppImage source={{ uri: item.logoUrl }} style={styles.logo} />
        <View style={styles.copy}>
          <AppText variant="h3" numberOfLines={1}>
            {item.name}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {pluralise(item.locationCount, 'location')} nearby
          </AppText>
        </View>
        <Icon name="chevronRight" size={16} color={colors.textMuted} />
      </Pressable>
    ),
    [openChain],
  );

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Brands you love" />
      <QueryBoundary {...query} skeleton={<ChainsSkeleton />}>
        {chains => (
          <FlatList
            data={chains}
            renderItem={renderChain}
            keyExtractor={chain => chain.id}
            contentContainerStyle={styles.content}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <AppText variant="body" color="textMuted" style={styles.intro}>
                Pick a brand to compare its locations and delivery times.
              </AppText>
            }
          />
        )}
      </QueryBoundary>
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

function ChainsSkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={92} radius={14} />
      <Skeleton height={92} radius={14} />
      <Skeleton height={92} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge },
  intro: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    ...surfaces.card,
  },
  logo: { width: 68, height: 68, borderRadius: radii.md },
  copy: { flex: 1, gap: spacing.xxs },
  separator: { height: spacing.md },
  pressed: { opacity: 0.9 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.md },
});
