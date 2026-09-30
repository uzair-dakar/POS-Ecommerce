import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, IconButton } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';

export type MonthCalendarProps = {
  /** ISO "YYYY-MM-DD". */
  value: string;
  onChange: (date: string) => void;
  month: Date;
  onChangeMonth: (month: Date) => void;
  /** Dates before this are not selectable. */
  minDate: Date;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Month grid for picking a reservation date.
 *
 * Hand-rolled rather than pulled from a date library: the app needs exactly
 * one month view with one selection, and a library would add a dependency
 * plus its own theming layer for something this contained.
 */
function MonthCalendarBase({ value, onChange, month, onChangeMonth, minDate }: MonthCalendarProps) {
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    // Leading blanks so the 1st lands under its real weekday.
    const leading: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    const days = Array.from(
      { length: daysInMonth },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    );
    return [...leading, ...days];
  }, [month]);

  const min = startOfDay(minDate);
  const todayIso = toIso(min);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <IconButton
          name="chevronRight"
          accessibilityLabel="Previous month"
          variant="outline"
          size={36}
          style={styles.flip}
          onPress={() => onChangeMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        />
        <AppText variant="h3">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </AppText>
        <IconButton
          name="chevronRight"
          accessibilityLabel="Next month"
          variant="outline"
          size={36}
          onPress={() => onChangeMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        />
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <AppText key={index} variant="label" color="textSubtle" align="center" style={styles.cell}>
            {day}
          </AppText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`blank-${index}`} style={styles.cell} />;
          }

          const iso = toIso(date);
          const isSelected = iso === value;
          const isToday = iso === todayIso;
          const isPast = date < min;

          return (
            <Pressable
              key={iso}
              accessibilityRole="button"
              accessibilityLabel={iso}
              accessibilityState={{ selected: isSelected, disabled: isPast }}
              disabled={isPast}
              onPress={() => onChange(iso)}
              style={styles.cell}>
              <View
                style={[
                  styles.day,
                  isToday && !isSelected && styles.dayToday,
                  isSelected && styles.daySelected,
                ]}>
                <AppText
                  variant="captionStrong"
                  color={isSelected ? 'textInverse' : isPast ? 'textSubtle' : 'text'}>
                  {date.getDate()}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flip: { transform: [{ rotate: '180deg' }] },
  weekdays: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: spacing.xs },
  day: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: { borderWidth: 1.5, borderColor: colors.accent },
  daySelected: { backgroundColor: colors.primary },
});

export const MonthCalendar = memo(MonthCalendarBase);
export { toIso };
