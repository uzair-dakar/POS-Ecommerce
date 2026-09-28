import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon, SearchBar } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';

export type HomeHeaderProps = {
  deliverTo: string;
  onChangeAddress: () => void;
  onSearchPress: () => void;
};

function HomeHeaderBase({ deliverTo, onChangeAddress, onSearchPress }: HomeHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delivering to ${deliverTo}. Change address`}
          onPress={onChangeAddress}
          style={styles.address}>
          <View style={styles.pin}>
            <Icon name="pin" size={16} color={colors.accentPressed} />
          </View>
          <View>
            <AppText variant="label" color="textMuted">
              Deliver to
            </AppText>
            <View style={styles.addressRow}>
              <AppText variant="bodyStrong">{deliverTo}</AppText>
              <Icon name="chevronDown" size={14} color={colors.text} />
            </View>
          </View>
        </Pressable>

        <AppText variant="h3" color="textAccent" style={styles.logo}>
          BUZZ{'\n'}TILL
        </AppText>
      </View>

      <SearchBar
        placeholder="Search restaurants, dishes, shops..."
        onPress={onSearchPress}
        style={styles.search}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.sm, gap: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  address: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pin: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  logo: { fontStyle: 'italic', lineHeight: 15, fontSize: 13, textAlign: 'right' },
  search: { marginBottom: spacing.sm },
});

export const HomeHeader = memo(HomeHeaderBase);
