import type { Order, OrderStatus } from './api';
import type { Tone } from './components/ui';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'New order',
  accepted: 'Accepted',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled by customer',
};

export const STATUS_TONE: Record<OrderStatus, Tone> = {
  placed: 'warning',
  accepted: 'info',
  packed: 'info',
  out_for_delivery: 'accent',
  delivered: 'success',
  rejected: 'danger',
  cancelled: 'danger',
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  placed: '#f79009',
  accepted: '#2e90fa',
  packed: '#7a5af8',
  out_for_delivery: '#14b8a6',
  delivered: '#12b76a',
  rejected: '#f04438',
  cancelled: '#98a2b3',
};

export const FLOW: OrderStatus[] = [
  'placed',
  'accepted',
  'packed',
  'out_for_delivery',
  'delivered',
];

/** The one action that moves an order forward from each status. */
export const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  placed: { status: 'accepted', label: 'Accept order' },
  accepted: { status: 'packed', label: 'Mark as packed' },
  packed: { status: 'out_for_delivery', label: 'Send out for delivery' },
  out_for_delivery: { status: 'delivered', label: 'Delivered, cash collected' },
};

export const ACTIVE: OrderStatus[] = ['placed', 'accepted', 'packed', 'out_for_delivery'];

export const formatAddress = (a: Order['customer']['address']) =>
  [a.line1, a.line2, a.city, a.state, a.postalCode].filter(Boolean).join(', ');
