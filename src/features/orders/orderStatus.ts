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

export const isOrderLive = (status: OrderStatus): boolean =>
  status !== 'delivered' && status !== 'cancelled';
