/** Minor units (cents) keep money in integers — no floating point drift. */
export type Money = number;

const currencyFormatter = new Intl.NumberFormat('en-MT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

/** 1050 -> "€10.50" */
export const formatPrice = (minorUnits: Money): string =>
  currencyFormatter.format(minorUnits / 100);

/** 30, 'pc' -> "€0.30/pc". Takes the comparison price, not the pack price. */
export const formatUnitPrice = (minorUnits: Money, unit: string): string =>
  `${formatPrice(minorUnits)}/${unit}`;

/** 25, 40 -> "25-40 min" */
export const formatDeliveryWindow = (minMinutes: number, maxMinutes: number): string =>
  minMinutes === maxMinutes ? `${minMinutes} min` : `${minMinutes}-${maxMinutes} min`;

/** 0 -> "Free", 199 -> "€1.99" */
export const formatDeliveryFee = (minorUnits: Money): string =>
  minorUnits === 0 ? 'Free' : formatPrice(minorUnits);

/** 1750 -> "Open until 17:30" style time from a 24h "HH:mm" string. */
export const formatOpenUntil = (closesAt: string): string => `Open until ${closesAt}`;

/** 1 -> "1 item", 3 -> "3 items". Plural defaults to the singular plus "s". */
export const pluralise = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;

/** "19:30" -> "7:30 PM" */
export const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const RESERVATION_DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** "2026-09-15" -> "Tue, 15 Sep" */
export const formatReservationDate = (iso: string): string =>
  RESERVATION_DATE_FORMAT.format(new Date(`${iso}T00:00:00`)).replace(/,?\s+/, ', ');

/** Seconds remaining -> "04:52", for the hold countdown. */
export const formatCountdown = (totalSeconds: number): string => {
  const safe = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
