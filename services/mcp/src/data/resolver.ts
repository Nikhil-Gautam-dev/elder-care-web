import { ObjectId } from 'mongodb';
import { normalizeIndianPhone, relationWordMatches } from '@eldercare/shared';
import type { AuthContext } from '@eldercare/shared';
import { getUsersCollection, type FamilyDoc, type UserDoc } from '../config/db.js';
import {
  loadFamilyContext,
  normaliseAlias,
  type FamilyContext,
  type FamilyMemberContext,
} from './family.js';

export interface Candidate {
  name: string;
  relationship: string | null;
}

export interface ResolvedUserResult {
  callerUser: UserDoc | null;
  targetUser: UserDoc | null;
  family: FamilyDoc | null;
  /** What the target is to the caller ("father", "cousin"), or 'self'. */
  relationshipWithCaller: string | null;
  isSelf: boolean;
  isAdmin: boolean;
  /** Caller and target are in the same family. */
  isLinkedFamily: boolean;
  canReceiveNotifications: boolean;
  canManageOrders: boolean;
  canManageRides: boolean;
  /** Several people matched; the assistant should ask which one. */
  ambiguous?: Candidate[];
  error?: string;
}

const SELF_WORDS = ['', 'me', 'myself', 'my', 'i'];

function blank(callerUser: UserDoc | null, isAdmin: boolean): ResolvedUserResult {
  return {
    callerUser,
    targetUser: null,
    family: null,
    relationshipWithCaller: null,
    isSelf: false,
    isAdmin,
    isLinkedFamily: false,
    canReceiveNotifications: false,
    canManageOrders: false,
    canManageRides: false,
  };
}

function denied(callerUser: UserDoc | null, isAdmin: boolean, error: string): ResolvedUserResult {
  return { ...blank(callerUser, isAdmin), error };
}

function selfResult(
  user: UserDoc,
  isAdmin: boolean,
  ctx: FamilyContext | null,
): ResolvedUserResult {
  return {
    ...blank(user, isAdmin),
    targetUser: user,
    family: ctx?.family ?? null,
    relationshipWithCaller: 'self',
    isSelf: true,
    isLinkedFamily: false,
    canReceiveNotifications: true,
    canManageOrders: true,
    canManageRides: true,
  };
}

/**
 * Flags are the *caller's* permissions for the family's elders: ordering/rides only apply
 * when the target is an elder.
 */
function familyResult(
  caller: UserDoc,
  isAdmin: boolean,
  ctx: FamilyContext,
  target: FamilyMemberContext,
): ResolvedUserResult {
  const mine = ctx.viewer.member;
  return {
    ...blank(caller, isAdmin),
    targetUser: target.user,
    family: ctx.family,
    relationshipWithCaller: target.derived?.label ?? 'family member',
    isLinkedFamily: true,
    canReceiveNotifications: mine.canReceiveNotifications,
    canManageOrders: isAdmin || (mine.canManageOrders && target.member.isElder),
    canManageRides: isAdmin || (mine.canManageRides && target.member.isElder),
  };
}

const asCandidates = (members: FamilyMemberContext[]): Candidate[] =>
  members.map((m) => ({ name: m.user.name, relationship: m.derived?.label ?? null }));

/**
 * Finds who the caller means among their family. Tries, in order: the caller's own aliases
 * ("Dadu"), relationship words ("mom", "uncle"), then names. The first stage that matches wins;
 * several matches in that stage means the question is ambiguous.
 */
function matchMember(
  ctx: FamilyContext,
  identifier: string,
): { match?: FamilyMemberContext; ambiguous?: FamilyMemberContext[] } {
  const others = ctx.members.filter((m) => !m.isViewer);
  const word = normaliseAlias(identifier).replace(/^(my|your)\s+/, '');

  const stages: FamilyMemberContext[][] = [
    others.filter((m) => m.aliases.some((a) => normaliseAlias(a) === word)),
    others.filter(
      (m) =>
        m.derived &&
        (m.derived.label === word || relationWordMatches(word, m.derived, m.user.gender)),
    ),
    others.filter((m) => m.user.name.toLowerCase() === word),
    others.filter((m) => m.user.name.toLowerCase().includes(word)),
  ];

  for (const found of stages) {
    if (found.length === 1) return { match: found[0] };
    if (found.length > 1) return { ambiguous: found };
  }
  return {};
}

/**
 * Resolves who a tool call is about ("me", an alias, "mom", a name, or — for admins — an id/phone)
 * and what the authenticated caller is allowed to do for that person.
 */
export async function resolveTargetUserAndAuth(
  targetIdentifier: string | undefined,
  auth?: AuthContext,
): Promise<ResolvedUserResult> {
  const users = getUsersCollection();
  const isAdmin = auth?.role === 'admin';

  if (!auth?.id || !ObjectId.isValid(auth.id)) {
    return denied(null, isAdmin, 'The user is not signed in, so no account data can be accessed.');
  }

  const callerUser = await users.findOne({ _id: new ObjectId(auth.id) });
  if (!callerUser)
    return denied(null, isAdmin, `Signed-in user account '${auth.id}' was not found.`);

  const ctx = await loadFamilyContext(callerUser);
  const identifier = (targetIdentifier ?? '').trim();

  if (SELF_WORDS.includes(identifier.toLowerCase()) || identifier === auth.id) {
    return selfResult(callerUser, isAdmin, ctx);
  }

  if (ctx) {
    const { match, ambiguous } = matchMember(ctx, identifier);
    if (match) return familyResult(callerUser, isAdmin, ctx, match);
    if (ambiguous) return { ...blank(callerUser, isAdmin), ambiguous: asCandidates(ambiguous) };
  }

  if (isAdmin) {
    const byId = ObjectId.isValid(identifier)
      ? await users.findOne({ _id: new ObjectId(identifier) })
      : null;
    const target =
      byId ?? (await users.findOne({ phone: normalizeIndianPhone(identifier) ?? identifier }));
    if (target) {
      return {
        ...blank(callerUser, true),
        targetUser: target,
        relationshipWithCaller: target._id.equals(callerUser._id) ? 'self' : null,
        isSelf: target._id.equals(callerUser._id),
        canReceiveNotifications: true,
        canManageOrders: true,
        canManageRides: true,
      };
    }
  }

  return denied(
    callerUser,
    isAdmin,
    ctx
      ? `Could not find anyone called '${identifier}' in the family.`
      : `Could not find '${identifier}' — the user is not part of a family yet.`,
  );
}
