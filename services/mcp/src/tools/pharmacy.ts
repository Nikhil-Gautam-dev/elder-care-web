import { ObjectId } from 'mongodb';
import {
  deliveryAddressGaps,
  formatAddress,
  formatIndianPhone,
  medicationSupplyStatus,
  normalizeIndianPhone,
  packsForDays,
  type AuthContext,
  type PharmacyOrderStatus,
} from '@eldercare/shared';
import {
  getMedicationsCollection,
  getNotificationsCollection,
  getOrderDraftsCollection,
  getPharmacyOrdersCollection,
  getUsersCollection,
  type MedicationDoc,
  type OrderDraftDoc,
  type OrderLine,
  type PharmacyOrderDoc,
} from '../config/db.js';
import { loadFamilyContext } from '../data/family.js';
import { resolveTargetUserAndAuth } from '../data/resolver.js';
import {
  cancelPharmacyOrder,
  getPharmacyOrder,
  PharmacyError,
  placeOrder as placePharmacyOrder,
  searchCatalog,
} from '../pharmacy/client.js';
import { authorizeManage, findMedication } from './medications.js';
import {
  candidate,
  label,
  matchForMedication,
  matchForText,
  money,
  type CatalogMatch,
} from '../pharmacy/match.js';
import { authorize, fail, isFailure, type ToolResult } from './result.js';

const DRAFT_TTL_MS = 15 * 60 * 1000;
const DEFAULT_SUPPLY_DAYS = 30;
const MAX_PACKS = 20;
const FINAL_STATUSES: PharmacyOrderStatus[] = ['delivered', 'rejected', 'cancelled'];

const STATUS_TEXT: Record<PharmacyOrderStatus, string> = {
  placed: 'received by the pharmacy, waiting for them to accept it',
  accepted: 'accepted and being prepared',
  packed: 'packed and ready to go',
  out_for_delivery: 'out for delivery',
  delivered: 'delivered',
  rejected: 'rejected by the pharmacy',
  cancelled: 'cancelled',
};

const packText = (packs: number, size: number, unit: string) =>
  `${packs} pack${packs === 1 ? '' : 's'} of ${size} ${unit}`;

/** Turns pharmacy failures into something the assistant can say; unexpected errors bubble up. */
function pharmacyFail(err: unknown): ToolResult {
  if (err instanceof PharmacyError) {
    return { success: false, error: err.message, ...(err.status === 409 ? err.details : {}) };
  }
  throw err;
}

export async function searchMedicine(query: string, auth?: AuthContext): Promise<ToolResult> {
  const resolved = await authorize('me', auth, 'self-only');
  if (isFailure(resolved)) return resolved;
  try {
    const items = await searchCatalog(query.trim(), 8);
    return { success: true, count: items.length, medicines: items.map(candidate) };
  } catch (err) {
    return pharmacyFail(err);
  }
}

export interface OrderRequestItem {
  medication?: string;
  medicine?: string;
  packs?: number;
}

const formatDraftAddress = (a: OrderDraftDoc['customer']['address']) => formatAddress(a);

/**
 * Step 1 of ordering: works out exactly what would be ordered and stores it as a short-lived draft.
 * Nothing is sent to the pharmacy until `place_order` is called with the draft id.
 */
export async function prepareOrder(
  person: string | undefined,
  items: OrderRequestItem[],
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;
  if (items.length === 0 || items.length > 10)
    return fail('Give between 1 and 10 medicines to order.');

  const elder = resolved.targetUser;
  const phone = normalizeIndianPhone(elder.phone);
  const address = elder.address;
  if (!address?.line1?.trim() || !address.city?.trim()) {
    const gaps = deliveryAddressGaps(address);
    const who = resolved.isSelf ? 'Your' : `${elder.name}'s`;
    return {
      success: false,
      error: `${who} saved address is missing: ${gaps.join(' and ')}. ${
        resolved.isSelf
          ? 'Ask the user for it and save it with set_address (or they can add it on the Profile page).'
          : 'They need to add it on their Profile page.'
      }`,
      currentAddress: address ? formatAddress(address) || undefined : undefined,
    };
  }
  if (!phone)
    return fail(`${elder.name} has no valid mobile number saved, which the pharmacy needs.`);

  const lines = new Map<string, OrderLine & { reason?: string }>();
  const problems: Record<string, unknown>[] = [];

  try {
    for (const request of items) {
      const asked = request.medication ?? request.medicine ?? '';
      if (!asked.trim()) {
        problems.push({
          request: '(empty)',
          error: 'Each item needs a medication or medicine name.',
        });
        continue;
      }
      if (
        request.packs !== undefined &&
        (!Number.isInteger(request.packs) || request.packs < 1 || request.packs > MAX_PACKS)
      ) {
        problems.push({
          request: asked,
          error: `Packs must be a whole number from 1 to ${MAX_PACKS}.`,
        });
        continue;
      }

      let med: MedicationDoc | undefined;
      let match: CatalogMatch;
      if (request.medication) {
        const found = await findMedication(elder, request.medication);
        if ('failure' in found) {
          problems.push({ request: asked, ...found.failure });
          continue;
        }
        med = found.match;
        match = await matchForMedication(med);
      } else {
        match = await matchForText(asked);
      }

      if ('problem' in match) {
        problems.push({ request: asked, ...match.problem });
        continue;
      }

      const packs = request.packs ?? (med ? packsForDays(med, DEFAULT_SUPPLY_DAYS) : 1);
      const existing = lines.get(match.item.id);
      const totalPacks = packs + (existing?.packs ?? 0);
      if (match.item.stockPacks < totalPacks) {
        problems.push({
          request: asked,
          error: `Only ${match.item.stockPacks} pack(s) of ${label(match.item)} in stock.`,
          availablePacks: match.item.stockPacks,
        });
        continue;
      }

      lines.set(match.item.id, {
        medicationId: existing?.medicationId ?? med?._id,
        catalogItemId: match.item.id,
        brand: match.item.brand,
        generic: match.item.generic,
        strength: match.item.strength,
        packs: totalPacks,
        packSize: match.item.packSize,
        packUnit: match.item.packUnit,
        pricePerPack: match.item.pricePerPack,
        reason:
          request.packs === undefined && med
            ? `about ${DEFAULT_SUPPLY_DAYS} days of ${med.name}`
            : undefined,
      });
    }
  } catch (err) {
    return pharmacyFail(err);
  }

  if (problems.length) {
    return {
      success: false,
      error: 'The order could not be prepared yet.',
      needsAttention: problems,
    };
  }

  const orderLines = [...lines.values()];
  const total =
    Math.round(orderLines.reduce((sum, l) => sum + l.pricePerPack * l.packs, 0) * 100) / 100;
  const now = new Date();
  const draft: OrderDraftDoc = {
    _id: new ObjectId(),
    callerId: resolved.callerUser._id,
    elderId: elder._id,
    items: orderLines.map(({ reason: _reason, ...line }) => line),
    total,
    customer: {
      name: elder.name,
      phone,
      address: {
        line1: address.line1.trim(),
        ...(address.line2 ? { line2: address.line2 } : {}),
        city: address.city.trim(),
        ...(address.state ? { state: address.state } : {}),
        ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      },
    },
    used: false,
    createdAt: now,
    expiresAt: new Date(now.getTime() + DRAFT_TTL_MS),
  };
  await getOrderDraftsCollection().insertOne(draft);

  return {
    success: true,
    draftId: draft._id.toString(),
    orderFor: resolved.isSelf ? 'you' : elder.name,
    items: orderLines.map((l) => ({
      medicine: `${label(l)} (${l.generic})`,
      quantity: packText(l.packs, l.packSize, l.packUnit),
      price: money(l.pricePerPack * l.packs),
      note: l.reason,
    })),
    total: money(total),
    deliverTo: formatDraftAddress(draft.customer.address),
    contactNumber: formatIndianPhone(phone),
    payment: 'Cash on delivery',
    validForMinutes: DRAFT_TTL_MS / 60000,
    next: 'Read this back to the user. Only call place_order with draftId after a clear yes.',
  };
}

const summarise = (lines: OrderLine[]) => lines.map((l) => `${label(l)} × ${l.packs}`).join(', ');

/** Step 2: places exactly the confirmed draft at the pharmacy and tells the family. */
export async function placeOrder(draftId: string, auth?: AuthContext): Promise<ToolResult> {
  const resolvedCaller = await authorize('me', auth, 'self-only');
  if (isFailure(resolvedCaller)) return resolvedCaller;
  const caller = resolvedCaller.callerUser;

  const drafts = getOrderDraftsCollection();
  const draft = ObjectId.isValid(draftId)
    ? await drafts.findOne({ _id: new ObjectId(draftId) })
    : null;
  if (!draft || draft.expiresAt < new Date()) {
    return fail('That order summary has expired or does not exist. Prepare the order again first.');
  }
  if (!draft.callerId.equals(caller._id))
    return fail('That order summary belongs to someone else.');
  if (draft.used) return fail('That order has already been placed.');

  // Permission may have changed since the summary was prepared.
  const elder = await resolveTargetUserAndAuth(draft.elderId.toString(), auth);
  if (elder.error || !elder.targetUser || !elder.canManageOrders) {
    return fail('You no longer have permission to order for this person.');
  }

  const claimed = await drafts.findOneAndUpdate(
    { _id: draft._id, used: false },
    { $set: { used: true } },
  );
  if (!claimed) return fail('That order has already been placed.');

  let placed;
  try {
    placed = await placePharmacyOrder({
      customer: draft.customer,
      items: draft.items.map((l) => ({ catalogItemId: l.catalogItemId, packs: l.packs })),
      idempotencyKey: draft._id.toString(),
      externalRef: { elderId: draft.elderId.toString(), orderedBy: caller._id.toString() },
    });
  } catch (err) {
    await drafts.updateOne({ _id: draft._id }, { $set: { used: false } });
    return pharmacyFail(err);
  }

  const now = new Date();
  const record: PharmacyOrderDoc = {
    _id: new ObjectId(),
    pharmacyOrderId: placed.id,
    orderNumber: placed.orderNumber,
    elderId: draft.elderId,
    orderedBy: caller._id,
    orderedByName: caller.name,
    items: draft.items,
    total: placed.total,
    status: placed.status as PharmacyOrderStatus,
    statusUpdatedAt: now,
    suppliesApplied: false,
    createdAt: now,
  };
  await getPharmacyOrdersCollection().insertOne(record);

  await notifyFamily(caller.name, elder.targetUser.name, elder.isSelf, record, draft.items);

  return {
    success: true,
    orderNumber: record.orderNumber,
    status: STATUS_TEXT[record.status],
    items: draft.items.map((l) => ({
      medicine: label(l),
      quantity: packText(l.packs, l.packSize, l.packUnit),
    })),
    total: money(record.total),
    payment: 'Cash on delivery',
    deliverTo: formatDraftAddress(draft.customer.address),
  };
}

async function notifyFamily(
  orderedByName: string,
  elderName: string,
  isSelf: boolean,
  order: PharmacyOrderDoc,
  lines: OrderLine[],
): Promise<void> {
  const orderer = await loadOrdererFamily(order.orderedBy);
  if (!orderer) return;

  const who = isSelf ? orderedByName : `${orderedByName} (for ${elderName})`;
  const message = `${who} ordered ${summarise(lines)} — ${money(order.total)}, cash on delivery. Order ${order.orderNumber}.`;

  const recipients = new Map<string, ObjectId>();
  for (const m of orderer.members) {
    if (m.isViewer) continue;
    if (m.member.canReceiveNotifications || m.user._id.equals(order.elderId)) {
      recipients.set(m.user._id.toString(), m.user._id);
    }
  }
  if (recipients.size === 0) return;

  const now = new Date();
  await getNotificationsCollection().insertMany(
    [...recipients.values()].map((recipientId) => ({
      recipientId,
      senderId: order.orderedBy,
      senderName: orderedByName,
      aboutUserId: order.elderId,
      message,
      read: false,
      createdAt: now,
    })),
  );
}

async function loadOrdererFamily(userId: ObjectId) {
  const user = await getUsersCollection().findOne({ _id: userId });
  return user ? loadFamilyContext(user) : null;
}

/** When an order arrives, add its units to the medicines it was for — exactly once. */
async function applySupplies(order: PharmacyOrderDoc): Promise<void> {
  const claimed = await getPharmacyOrdersCollection().findOneAndUpdate(
    { _id: order._id, suppliesApplied: false },
    { $set: { suppliesApplied: true } },
  );
  if (!claimed) return;

  const meds = getMedicationsCollection();
  const now = new Date();
  for (const line of order.items) {
    if (!line.medicationId) continue;
    const med = await meds.findOne({ _id: line.medicationId });
    if (!med) continue;
    const unitsLeft = medicationSupplyStatus(med, now).unitsLeft;
    await meds.updateOne(
      { _id: med._id },
      {
        $set: {
          'supply.unitsRemaining': unitsLeft + line.packs * line.packSize,
          'supply.asOf': now,
          updatedAt: now,
        },
      },
    );
  }
}

async function refresh(order: PharmacyOrderDoc): Promise<PharmacyOrderDoc> {
  if (
    FINAL_STATUSES.includes(order.status) &&
    (order.status !== 'delivered' || order.suppliesApplied)
  ) {
    return order;
  }
  try {
    const latest = await getPharmacyOrder(order.pharmacyOrderId);
    const status = latest.status as PharmacyOrderStatus;
    const next: PharmacyOrderDoc = { ...order, status };
    if (status !== order.status) {
      next.statusUpdatedAt = new Date();
      await getPharmacyOrdersCollection().updateOne(
        { _id: order._id },
        { $set: { status, statusUpdatedAt: next.statusUpdatedAt } },
      );
    }
    if (status === 'delivered') await applySupplies(next);
    return next;
  } catch {
    return order; // pharmacy unreachable: fall back to the last known status
  }
}

const orderView = (o: PharmacyOrderDoc) => ({
  orderNumber: o.orderNumber,
  status: STATUS_TEXT[o.status],
  items: o.items.map((l) => ({
    medicine: label(l),
    quantity: packText(l.packs, l.packSize, l.packUnit),
  })),
  total: money(o.total),
  orderedBy: o.orderedByName,
  placedAt: o.createdAt,
  lastUpdate: o.statusUpdatedAt,
});

export async function getOrderStatus(
  person: string | undefined,
  orderNumber: string | undefined,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorize(person, auth, 'self-or-family');
  if (isFailure(resolved)) return resolved;

  const orders = await getPharmacyOrdersCollection()
    .find({
      elderId: resolved.targetUser._id,
      ...(orderNumber ? { orderNumber: orderNumber.trim().toUpperCase() } : {}),
    })
    .sort({ createdAt: -1 })
    .limit(orderNumber ? 1 : 3)
    .toArray();

  if (orders.length === 0) {
    return { success: true, count: 0, message: 'No pharmacy orders found.' };
  }

  const fresh = await Promise.all(orders.map(refresh));
  return { success: true, count: fresh.length, orders: fresh.map(orderView) };
}

export async function cancelOrder(
  person: string | undefined,
  orderNumber: string,
  auth?: AuthContext,
): Promise<ToolResult> {
  const resolved = await authorizeManage(person, auth);
  if (isFailure(resolved)) return resolved;

  const orders = getPharmacyOrdersCollection();
  const order = await orders.findOne({
    elderId: resolved.targetUser._id,
    orderNumber: orderNumber.trim().toUpperCase(),
  });
  if (!order) return fail(`No order ${orderNumber} found for ${resolved.targetUser.name}.`);

  const current = await refresh(order);
  if (current.status === 'cancelled')
    return { success: true, message: 'That order was already cancelled.' };

  try {
    await cancelPharmacyOrder(order.pharmacyOrderId);
  } catch (err) {
    if (err instanceof PharmacyError && err.status === 409) {
      return fail(
        'That order can no longer be cancelled because the pharmacy has already started on it.',
      );
    }
    return pharmacyFail(err);
  }

  await orders.updateOne(
    { _id: order._id },
    { $set: { status: 'cancelled', statusUpdatedAt: new Date() } },
  );
  return { success: true, cancelled: order.orderNumber };
}
