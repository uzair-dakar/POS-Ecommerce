import type { BadgeTone } from '../../components/ui';
import type { OrderStatus } from '../../types';

/** Ordered lifecycle. Index doubles as progress through the timeline. */
export const ORDER_FLOW: readonly OrderStatus[] = [
  'placed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  placed: 'info',
  preparing: 'accent',
  ready: 'accent',
  out_for_delivery: 'accent',
  delivered: 'success',
  cancelled: 'danger',
};

/** 0-1, for the progress bars on the history cards. */
export const orderProgress = (status: OrderStatus): number => {
  if (status === 'cancelled') {
    return 0;
  }
  const index = ORDER_FLOW.indexOf(status);
  return index < 0 ? 0 : (index + 1) / ORDER_FLOW.length;
};

/**
 * What the tracking screen says, in the customer's terms.
 *
 * A status name tells you a state; this tells you what is happening to your
 * food and what to expect next, which is the only reason anyone opens this
 * screen while they wait.
 */
export const ORDER_STATUS_COPY: Record<
  OrderStatus,
  { headline: string; detail: string }
> = {
  placed: {
    headline: 'Order sent to the kitchen.',
    detail: "We're waiting for them to confirm it — any minute now.",
  },
  preparing: {
    headline: 'Someone is cooking your food.',
    detail: "It's being made fresh right now.",
  },
  ready: {
    headline: "It's packed and waiting for a rider.",
    detail: 'A courier is on the way to collect it.',
  },
  out_for_delivery: {
    headline: 'Your order is on its way.',
    detail: 'Keep your phone close — the rider may call.',
  },
  delivered: {
    headline: 'Delivered. Enjoy!',
    detail: 'Thanks for ordering with us.',
  },
  cancelled: {
    headline: 'This order was cancelled.',
    detail: 'Nothing has been charged to your card.',
  },
};

export const isOrderLive = (status: OrderStatus): boolean =>
  status !== 'delivered' && status !== 'cancelled';
