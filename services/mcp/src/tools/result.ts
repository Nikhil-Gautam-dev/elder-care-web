import type { AuthContext } from '@eldercare/shared';
import { resolveTargetUserAndAuth, type ResolvedUserResult } from '../data/resolver.js';

export type ToolResult = Record<string, unknown> & { success: boolean; error?: string };

export const fail = (error: string): ToolResult => ({ success: false, error });

type Access = 'self-or-family' | 'self-only';
type Authorized = ResolvedUserResult & {
  targetUser: NonNullable<ResolvedUserResult['targetUser']>;
  callerUser: NonNullable<ResolvedUserResult['callerUser']>;
};

/**
 * Resolves the person a tool call is about and enforces the access rule.
 * Returns either a failed ToolResult (including "which one do you mean?" candidates)
 * or the resolved user with non-null caller and target.
 */
export async function authorize(
  person: string | undefined,
  auth: AuthContext | undefined,
  access: Access,
): Promise<ToolResult | Authorized> {
  const resolved = await resolveTargetUserAndAuth(person, auth);

  if (resolved.ambiguous) {
    return {
      success: false,
      ambiguous: true,
      candidates: resolved.ambiguous,
      error: `More than one person matches '${person ?? ''}'. Ask the user which one they mean.`,
    };
  }
  if (resolved.error || !resolved.targetUser || !resolved.callerUser) {
    return fail(resolved.error ?? `Could not find '${person ?? 'me'}'.`);
  }

  const allowed =
    resolved.isSelf || resolved.isAdmin || (access === 'self-or-family' && resolved.isLinkedFamily);
  if (!allowed) return fail("You don't have permission to see that person's information.");

  return resolved as Authorized;
}

export const isFailure = (value: object): value is ToolResult =>
  'success' in value && (value as ToolResult).success === false;
