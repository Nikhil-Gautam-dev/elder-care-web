import {
  deriveRelationship,
  type DerivedRelation,
  type Gender,
  type RelationEdge,
} from '@eldercare/shared';
import {
  getFamiliesCollection,
  getFamilyAliasesCollection,
  getUsersCollection,
  type FamilyDoc,
  type FamilyMemberDoc,
  type UserDoc,
} from '../config/db.js';

export interface FamilyMemberContext {
  user: UserDoc;
  member: FamilyMemberDoc;
  isViewer: boolean;
  /** What this person is to the viewer; null for the viewer or unconnected members. */
  derived: DerivedRelation | null;
  /** The viewer's own private aliases for this person. */
  aliases: string[];
}

export interface FamilyContext {
  family: FamilyDoc;
  viewer: FamilyMemberContext;
  members: FamilyMemberContext[];
}

export const normaliseAlias = (alias: string) => alias.trim().toLowerCase().replace(/\s+/g, ' ');

/** Loads the viewer's family with every member, their relation to the viewer and the viewer's aliases. */
export async function loadFamilyContext(viewer: UserDoc): Promise<FamilyContext | null> {
  if (!viewer.familyId) return null;

  const family = await getFamiliesCollection().findOne({ _id: viewer.familyId });
  if (!family) return null;

  const users = await getUsersCollection()
    .find({ _id: { $in: family.members.map((m) => m.userId) } })
    .toArray();
  const byId = new Map(users.map((u) => [u._id.toString(), u]));
  const genderOf = (id: string): Gender | undefined => byId.get(id)?.gender;

  const edges: RelationEdge[] = family.relations.map((r) => ({
    kind: r.kind,
    a: r.a.toString(),
    b: r.b.toString(),
  }));

  const aliases = await getFamilyAliasesCollection()
    .find({ familyId: family._id, ownerId: viewer._id })
    .toArray();

  const viewerId = viewer._id.toString();
  const members: FamilyMemberContext[] = [];
  for (const member of family.members) {
    const user = byId.get(member.userId.toString());
    if (!user) continue;
    const isViewer = member.userId.equals(viewer._id);
    members.push({
      user,
      member,
      isViewer,
      derived: isViewer ? null : deriveRelationship(edges, viewerId, user._id.toString(), genderOf),
      aliases: aliases.filter((a) => a.targetId.equals(member.userId)).map((a) => a.alias),
    });
  }

  const me = members.find((m) => m.isViewer);
  if (!me) return null;
  return { family, viewer: me, members };
}
