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

/** 189, 'kg' -> "€1.89/kg" */
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
