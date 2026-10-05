import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, ScreenHeader } from '../../../components/layout';
import { AppText, Button, Icon } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';

type SavedAddress = {
  id: string;
  label: string;
  line: string;
  icon: 'home' | 'store' | 'pin';
};

/** Stand-in for the address book until the account API exists. */
const SAVED_ADDRESSES: readonly SavedAddress[] = [
  { id: 'a_home', label: 'Home', line: '12 Triq Hal Taxien, Valletta', icon: 'home' },
  { id: 'a_work', label: 'Work', line: '48 The Strand, Sliema', icon: 'store' },
  { id: 'a_other', label: "Mum's", line: '3 Saqqajja Square, Rabat', icon: 'pin' },
];

export function AddressesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(SAVED_ADDRESSES[0].id);

  const confirm = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Delivery address" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="body" color="textMuted">
          Choose where this order should go.
        </AppText>

        <View style={styles.list}>
          {SAVED_ADDRESSES.map(address => {
            const isSelected = address.id === selectedId;
            return (
              <Pressable
                key={address.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${address.label}, ${address.line}`}
                onPress={() => setSelectedId(address.id)}
                style={[styles.row, isSelected && styles.rowSelected]}>
                <View style={[styles.icon, isSelected && styles.iconSelected]}>
                  <Icon
                    name={address.icon}
                    size={18}
                    color={isSelected ? colors.accentPressed : colors.textMuted}
                  />
                </View>

                <View style={styles.copy}>
                  <AppText variant="bodyStrong">{address.label}</AppText>
                  <AppText variant="caption" color="textMuted">
                    {address.line}
                  </AppText>
                </View>

                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" style={styles.addRow} onPress={() => {}}>
          <Icon name="plus" size={16} color={colors.accentPressed} strokeWidth={2.6} />
          <AppText variant="captionStrong" color="textAccent">
            Add a new address
          </AppText>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button label="Deliver here" onPress={confirm} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_GUTTER, gap: spacing.lg },
  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    ...surfaces.outlined,
  },
  rowSelected: { borderColor: colors.accent },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelected: { backgroundColor: colors.accentSoft },
  copy: { flex: 1, gap: spacing.xxs },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: radii.pill, backgroundColor: colors.surface },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  footer: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
});
