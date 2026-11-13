import type {
  MerchantId,
  ReservationAvailability,
  ReservationSlot,
  SeatingKind,
  SeatingOption,
} from '../../../types';
import type { ReservationAvailabilityDto } from '../dto';
import { text } from './common';

/**
 * The reservation endpoints speak in free-text seating names; the app models
 * four known kinds so the UI can draw an icon per option. Anything the
 * backend sends that is not recognised is dropped rather than mis-drawn.
 */
const SEATING_BY_NAME: Record<string, SeatingKind> = {
  indoor: 'standard',
  standard: 'standard',
  outdoor: 'outdoor',
  terrace: 'outdoor',
  booth: 'high_top',
  'high top': 'high_top',
  counter: 'counter',
  window: 'counter',
};

const DEFAULT_SEATING: readonly SeatingOption[] = [
  { kind: 'standard', name: 'Standard', description: 'Comfortable interior', isAvailable: true },
  { kind: 'outdoor', name: 'Outdoor', description: 'Fresh-air seating', isAvailable: true },
  { kind: 'high_top', name: 'High Top', description: 'Private & relaxed', isAvailable: true },
  { kind: 'counter', name: 'Counter', description: 'Best views', isAvailable: true },
];

const DESCRIPTION_BY_KIND: Record<SeatingKind, string> = {
  standard: 'Comfortable interior',
  outdoor: 'Fresh-air seating',
  high_top: 'Private & relaxed',
  counter: 'Best views',
};

const NAME_BY_KIND: Record<SeatingKind, string> = {
  standard: 'Standard',
  outdoor: 'Outdoor',
  high_top: 'High Top',
  counter: 'Counter',
};

export const seatingKindFor = (name: string): SeatingKind | undefined =>
  SEATING_BY_NAME[name.trim().toLowerCase()];

/** The hold and confirm calls want the backend's own wording back. */
export const seatingNameFor = (kind: SeatingKind): string => NAME_BY_KIND[kind];

const mapSlots = (dto: ReservationAvailabilityDto): ReservationSlot[] => {
  if (dto.slots?.length) {
    return dto.slots.map(slot => ({
      time: text(slot.time),
      isAvailable: slot.isAvailable !== false,
    }));
  }

  return (dto.availableTimes ?? []).map(time => ({ time: text(time), isAvailable: true }));
};

const mapSeating = (dto: ReservationAvailabilityDto): readonly SeatingOption[] => {
  const options = (dto.seatingOptions ?? [])
    .map(option => {
      const kind = seatingKindFor(text(option.seatingOption, text(option.name)));
      if (!kind) {
        return null;
      }
      return {
        kind,
        name: NAME_BY_KIND[kind],
        description: DESCRIPTION_BY_KIND[kind],
        isAvailable: option.isAvailable !== false,
      } satisfies SeatingOption;
    })
    .filter((option): option is SeatingOption => option !== null);

  return options.length > 0 ? options : DEFAULT_SEATING;
};

export function mapAvailability(
  dto: ReservationAvailabilityDto,
  merchantId: MerchantId,
  merchantName: string,
): ReservationAvailability {
  return {
    merchantId,
    merchantName,
    slots: mapSlots(dto),
    seating: mapSeating(dto),
    maxGuests: Number(dto.maxGuests ?? 0) || 12,
  };
}
