import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  deriveRelationship,
  type FamilyView,
  type Gender,
  type RelationEdge,
  type SetAliasBody,
  type UpdateMemberBody,
} from '@eldercare/shared';
import { createError } from '../middleware/errorHandler.js';
import {
  getFamiliesCollection,
  getFamilyAliasesCollection,
  getFamilyInvitesCollection,
  getUsersCollection,
  type FamilyDoc,
} from '../models/user.model.js';

const MAX_ALIAS_LENGTH = 40;

export const normaliseAlias = (alias: string) => alias.trim().toLowerCase().replace(/\s+/g, ' ');

function toObjectId(id: string | undefined): ObjectId {
  if (!id || !ObjectId.isValid(id)) throw createError(`Invalid ID: ${id ?? ''}`, 400);
  return new ObjectId(id);
}

/** Loads the caller's family or throws 404. */
async function loadMyFamily(req: Request): Promise<{ me: ObjectId; family: FamilyDoc }> {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);

  const me = new ObjectId(userId);
  const user = await getUsersCollection().findOne({ _id: me });
  if (!user?.familyId) throw createError('You are not in a family yet', 404);

  const family = await getFamiliesCollection().findOne({ _id: user.familyId });
  if (!family) throw createError('Family not found', 404);
  return { me, family };
}

function requireAdmin(family: FamilyDoc, me: ObjectId): void {
  if (!family.members.some((m) => m.isAdmin && m.userId.equals(me))) {
    throw createError('Only a family admin can do this', 403);
  }
}

export async function getMyFamily(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);

  const me = new ObjectId(userId);
  const users = getUsersCollection();
  const user = await users.findOne({ _id: me });
  if (!user) throw createError('User not found', 404);

  const family = user.familyId
    ? await getFamiliesCollection().findOne({ _id: user.familyId })
    : null;
  if (!family) {
    res.json({ success: true, data: null });
    return;
  }

  const memberUsers = await users
    .find({ _id: { $in: family.members.map((m) => m.userId) } })
    .toArray();
  const byId = new Map(memberUsers.map((u) => [u._id.toString(), u]));
  const genderOf = (id: string): Gender | undefined => byId.get(id)?.gender;

  const edges: RelationEdge[] = family.relations.map((r) => ({
    kind: r.kind,
    a: r.a.toString(),
    b: r.b.toString(),
  }));

  const myAliases = await getFamilyAliasesCollection()
    .find({ familyId: family._id, ownerId: me })
    .toArray();

  const view: FamilyView = {
    id: family._id.toString(),
    name: family.name,
    members: family.members.map((m) => {
      const id = m.userId.toString();
      const u = byId.get(id);
      const isMe = m.userId.equals(me);
      return {
        userId: id,
        name: u?.name ?? 'Unknown',
        phone: u?.phone ?? '',
        gender: u?.gender,
        isMe,
        isAdmin: m.isAdmin,
        isElder: m.isElder,
        canReceiveNotifications: m.canReceiveNotifications,
        canManageOrders: m.canManageOrders,
        canManageRides: m.canManageRides,
        joinedAt: m.joinedAt,
        relationship: isMe
          ? null
          : (deriveRelationship(edges, userId, id, genderOf)?.label ?? null),
        aliases: myAliases
          .filter((a) => a.targetId.equals(m.userId))
          .map((a) => ({ id: a._id.toString(), alias: a.alias })),
      };
    }),
  };

  res.json({ success: true, data: view });
}

export async function renameFamily(req: Request, res: Response): Promise<void> {
  const { me, family } = await loadMyFamily(req);
  requireAdmin(family, me);

  const name = (req.body as { name?: string }).name?.trim();
  if (!name || name.length > 80) throw createError('name is required (max 80 characters)', 400);

  await getFamiliesCollection().updateOne({ _id: family._id }, { $set: { name } });
  res.json({ success: true, data: { name } });
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  const { me, family } = await loadMyFamily(req);
  requireAdmin(family, me);

  const targetId = toObjectId(req.params['userId']);
  const body = req.body as UpdateMemberBody;

  const fields = [
    'isAdmin',
    'isElder',
    'canReceiveNotifications',
    'canManageOrders',
    'canManageRides',
  ] as const;
  const $set: Record<string, boolean> = {};
  for (const field of fields) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'boolean') throw createError(`${field} must be a boolean`, 400);
    $set[`members.$.${field}`] = value;
  }
  if (Object.keys($set).length === 0) throw createError('Nothing to update', 400);

  if (
    body.isAdmin === false &&
    family.members.filter((m) => m.isAdmin && !m.userId.equals(targetId)).length === 0
  ) {
    throw createError('A family needs at least one admin', 400);
  }

  const result = await getFamiliesCollection().updateOne(
    { _id: family._id, 'members.userId': targetId },
    { $set },
  );
  if (result.matchedCount === 0) throw createError('Family member not found', 404);

  res.json({ success: true, data: { userId: targetId.toString(), ...body } });
}

/** An admin can remove anyone; anyone can remove themselves (leave). */
export async function removeMember(req: Request, res: Response): Promise<void> {
  const { me, family } = await loadMyFamily(req);
  const targetId = toObjectId(req.params['userId']);

  if (!targetId.equals(me)) requireAdmin(family, me);
  if (!family.members.some((m) => m.userId.equals(targetId))) {
    throw createError('Family member not found', 404);
  }

  const families = getFamiliesCollection();
  const remaining = family.members.filter((m) => !m.userId.equals(targetId));

  if (remaining.length === 0) {
    await families.deleteOne({ _id: family._id });
    await getFamilyAliasesCollection().deleteMany({ familyId: family._id });
    await getFamilyInvitesCollection().updateMany(
      { familyId: family._id, status: 'pending' },
      { $set: { status: 'cancelled', updatedAt: new Date() } },
    );
  } else {
    if (!remaining.some((m) => m.isAdmin)) {
      const oldest = [...remaining].sort((x, y) => x.joinedAt.getTime() - y.joinedAt.getTime())[0]!;
      oldest.isAdmin = true;
    }
    await families.updateOne(
      { _id: family._id },
      {
        $set: {
          members: remaining,
          relations: family.relations.filter((r) => !r.a.equals(targetId) && !r.b.equals(targetId)),
        },
      },
    );
    await getFamilyAliasesCollection().deleteMany({
      familyId: family._id,
      $or: [{ ownerId: targetId }, { targetId }],
    });
  }

  await getUsersCollection().updateOne(
    { _id: targetId },
    { $unset: { familyId: '' }, $set: { updatedAt: new Date() } },
  );

  res.json({ success: true, data: { userId: targetId.toString(), left: targetId.equals(me) } });
}

export async function setAlias(req: Request, res: Response): Promise<void> {
  const { me, family } = await loadMyFamily(req);
  const body = req.body as SetAliasBody;

  const targetId = toObjectId(body.targetId);
  const alias = body.alias?.trim();
  if (!alias || alias.length > MAX_ALIAS_LENGTH) {
    throw createError(`alias is required (max ${MAX_ALIAS_LENGTH} characters)`, 400);
  }
  if (targetId.equals(me)) throw createError('You cannot set an alias for yourself', 400);
  if (!family.members.some((m) => m.userId.equals(targetId))) {
    throw createError('That person is not in your family', 404);
  }

  const aliasNorm = normaliseAlias(alias);
  const aliases = getFamilyAliasesCollection();
  await aliases.updateOne(
    { ownerId: me, targetId, aliasNorm },
    {
      $set: { alias },
      $setOnInsert: { _id: new ObjectId(), familyId: family._id, ownerId: me, targetId, aliasNorm },
    },
    { upsert: true },
  );

  const saved = await aliases.findOne({ ownerId: me, targetId, aliasNorm });
  res.status(201).json({
    success: true,
    data: { id: saved?._id.toString(), targetId: targetId.toString(), alias },
  });
}

export async function deleteAlias(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw createError('Unauthorized', 401);

  const result = await getFamilyAliasesCollection().deleteOne({
    _id: toObjectId(req.params['id']),
    ownerId: new ObjectId(userId),
  });
  if (result.deletedCount === 0) throw createError('Alias not found', 404);

  res.json({ success: true, data: { id: req.params['id'] } });
}
