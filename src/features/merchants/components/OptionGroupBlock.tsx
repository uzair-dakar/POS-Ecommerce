import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Badge, Icon } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';
import { formatPrice } from '../../../utils';
import type { OptionId, ProductOption, ProductOptionGroup } from '../../../types';

export type OptionGroupBlockProps = {
  group: ProductOptionGroup;
  selectedIds: readonly OptionId[];
  onToggle: (group: ProductOptionGroup, option: ProductOption) => void;
};

/**
 * One block of choices. A group that allows a single selection renders as
 * radios, more than one as checkboxes — the server's `maxSelections` decides,
 * so a menu change never needs an app release.
 */
function OptionGroupBlockBase({ group, selectedIds, onToggle }: OptionGroupBlockProps) {
  const isSingle = group.maxSelections === 1;
  const isRequired = group.minSelections > 0;
  const atLimit = selectedIds.length >= group.maxSelections;

  const subtitle = isSingle
    ? 'Choose 1'
    : `Choose up to ${group.maxSelections}${
        selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : ''
      }`;

  const handlePress = useCallback(
    (option: ProductOption) => onToggle(group, option),
    [group, onToggle],
  );

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="h3">{group.name}</AppText>
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        </View>
        <Badge
          label={isRequired ? 'Required' : 'Optional'}
          tone={isRequired ? 'solid' : 'neutral'}
          style={isRequired ? styles.requiredBadge : undefined}
        />
      </View>

      <View>
        {group.options.map(option => {
          const isSelected = selectedIds.includes(option.id);
          // A full multi-select group locks its unchosen options rather than
          // silently dropping an earlier pick.
          const isLocked = !option.isAvailable || (!isSingle && atLimit && !isSelected);

          return (
            <Pressable
              key={option.id}
              accessibilityRole={isSingle ? 'radio' : 'checkbox'}
              accessibilityState={{ checked: isSelected, disabled: isLocked }}
              disabled={isLocked}
              onPress={() => handlePress(option)}
              style={({ pressed }) => [
                styles.option,
                isLocked && styles.optionLocked,
                pressed && styles.pressed,
              ]}>
              <View
                style={[
                  isSingle ? styles.radio : styles.checkbox,
                  isSelected && styles.controlSelected,
                ]}>
                {isSelected ? (
                  isSingle ? (
                    <View style={styles.radioDot} />
                  ) : (
                    <Icon name="check" size={13} color={colors.textInverse} />
                  )
                ) : null}
              </View>

              <AppText variant="bodyStrong" style={styles.optionName}>
                {option.name}
              </AppText>

              {option.priceDelta > 0 ? (
                <AppText variant="priceSmall" color={isSelected ? 'text' : 'textSubtle'}>
                  +{formatPrice(option.priceDelta)}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerCopy: { gap: spacing.xxs },
  requiredBadge: { backgroundColor: colors.primary },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  optionLocked: { opacity: 0.45 },
  optionName: { flex: 1 },

  radio: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 11, height: 11, borderRadius: radii.pill, backgroundColor: colors.surface },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  pressed: { opacity: 0.7 },
});

export const OptionGroupBlock = memo(OptionGroupBlockBase);
