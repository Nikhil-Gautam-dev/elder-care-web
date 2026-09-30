import type { Gender } from "../types/family.js";
import type { FamilyRelationship } from "../types/user.js";

/** `parent_of`: `a` is the parent of `b`. `spouse` / `sibling` are symmetric. */
export interface RelationEdge {
  kind: "parent_of" | "spouse" | "sibling";
  a: string;
  b: string;
}

type Hop = "up" | "down" | "side" | "spouse";

/** Gender-neutral relationship kind; `label` is the gendered word when the gender is known. */
export type RelationBase =
  | "parent"
  | "child"
  | "sibling"
  | "spouse"
  | "grandparent"
  | "grandchild"
  | "uncle_aunt"
  | "niece_nephew"
  | "cousin"
  | "parent_in_law"
  | "child_in_law"
  | "sibling_in_law"
  | "relative";

export interface DerivedRelation {
  base: RelationBase;
  /** What `toId` is to `fromId`, e.g. "father", "great-grandmother", "cousin". */
  label: string;
  /** How many direct links apart (0 = self). */
  distance: number;
}

const WORDS: Record<
  Exclude<RelationBase, "relative">,
  [male: string, female: string, other: string]
> = {
  parent: ["father", "mother", "parent"],
  child: ["son", "daughter", "child"],
  sibling: ["brother", "sister", "sibling"],
  spouse: ["husband", "wife", "spouse"],
  grandparent: ["grandfather", "grandmother", "grandparent"],
  grandchild: ["grandson", "granddaughter", "grandchild"],
  uncle_aunt: ["uncle", "aunt", "uncle or aunt"],
  niece_nephew: ["nephew", "niece", "nephew or niece"],
  cousin: ["cousin", "cousin", "cousin"],
  parent_in_law: ["father-in-law", "mother-in-law", "parent-in-law"],
  child_in_law: ["son-in-law", "daughter-in-law", "child-in-law"],
  sibling_in_law: ["brother-in-law", "sister-in-law", "sibling-in-law"],
};

function pick(
  base: Exclude<RelationBase, "relative">,
  gender?: Gender,
): string {
  const [male, female, other] = WORDS[base];
  return gender === "male" ? male : gender === "female" ? female : other;
}

/**
 * Turns a hop path into (generations up, generations down) through the common ancestor.
 * A sibling hop right after a `down` or right before an `up` is absorbed (my child's sibling is my child;
 * my sibling's parent is my parent); any other sibling hop means "up to the parent, then down".
 */
function toGenerations(hops: Hop[]): { up: number; down: number } | null {
  const steps = [...hops];
  for (let i = 0; i < steps.length; i++) {
    if (
      steps[i] === "side" &&
      (steps[i - 1] === "down" || steps[i + 1] === "up")
    ) {
      steps.splice(i, 1);
      i--;
    }
  }

  const expanded = steps.flatMap((h): Hop[] =>
    h === "side" ? ["up", "down"] : [h],
  );
  const firstDown = expanded.indexOf("down");
  const ups = firstDown === -1 ? expanded.length : firstDown;
  const downs = expanded.length - ups;
  if (
    expanded.slice(0, ups).some((h) => h !== "up") ||
    expanded.slice(ups).some((h) => h !== "down")
  ) {
    return null;
  }
  return { up: ups, down: downs };
}

function classifyBlood(
  up: number,
  down: number,
): { base: RelationBase; greats: number } {
  if (up === 0 && down === 0) return { base: "relative", greats: 0 };
  if (down === 0)
    return up === 1
      ? { base: "parent", greats: 0 }
      : { base: "grandparent", greats: up - 2 };
  if (up === 0)
    return down === 1
      ? { base: "child", greats: 0 }
      : { base: "grandchild", greats: down - 2 };
  if (up === 1 && down === 1) return { base: "sibling", greats: 0 };
  if (down === 1) return { base: "uncle_aunt", greats: up - 2 };
  if (up === 1) return { base: "niece_nephew", greats: down - 2 };
  return { base: "cousin", greats: 0 };
}

function classify(hops: Hop[]): { base: RelationBase; greats: number } {
  const relative = { base: "relative" as RelationBase, greats: 0 };
  const spouseAtStart = hops[0] === "spouse";
  const spouseAtEnd = !spouseAtStart && hops[hops.length - 1] === "spouse";
  const core = spouseAtStart
    ? hops.slice(1)
    : spouseAtEnd
      ? hops.slice(0, -1)
      : hops;
  if (core.includes("spouse")) return relative;

  const gens = toGenerations(core);
  if (!gens) return relative;
  const { up, down } = gens;

  if (!spouseAtStart && !spouseAtEnd) return classifyBlood(up, down);
  if (up === 0 && down === 0) return { base: "spouse", greats: 0 };

  // in-laws: my spouse's parent / sibling, or my child's / sibling's spouse
  if (spouseAtStart && up === 1 && down === 0)
    return { base: "parent_in_law", greats: 0 };
  if (spouseAtStart && up === 1 && down === 1)
    return { base: "sibling_in_law", greats: 0 };
  if (spouseAtEnd && up === 0 && down === 1)
    return { base: "child_in_law", greats: 0 };
  if (spouseAtEnd && up === 1 && down === 1)
    return { base: "sibling_in_law", greats: 0 };
  return relative;
}

/** Builds the neighbour lookup, including implicit sibling links (same parent). */
function buildGraph(
  edges: RelationEdge[],
): Map<string, { to: string; hop: Hop }[]> {
  const graph = new Map<string, { to: string; hop: Hop }[]>();
  const add = (from: string, to: string, hop: Hop) => {
    const list = graph.get(from) ?? [];
    if (!list.some((n) => n.to === to && n.hop === hop)) list.push({ to, hop });
    graph.set(from, list);
  };

  const childrenOf = new Map<string, string[]>();
  for (const { kind, a, b } of edges) {
    if (kind === "parent_of") {
      add(a, b, "down");
      add(b, a, "up");
      childrenOf.set(a, [...(childrenOf.get(a) ?? []), b]);
    } else if (kind === "spouse") {
      add(a, b, "spouse");
      add(b, a, "spouse");
    } else {
      add(a, b, "side");
      add(b, a, "side");
    }
  }

  for (const kids of childrenOf.values()) {
    for (const x of kids) for (const y of kids) if (x !== y) add(x, y, "side");
  }
  return graph;
}

/** Collapses chains like sibling-of-sibling into a single sibling hop. */
function normalise(hops: Hop[]): Hop[] {
  return hops.filter((hop, i) => !(hop === "side" && hops[i - 1] === "side"));
}

/** Shortest hop path from one person to another, or null when they are not connected. */
function findPath(
  graph: ReturnType<typeof buildGraph>,
  fromId: string,
  toId: string,
): Hop[] | null {
  if (fromId === toId) return [];
  const seen = new Set([fromId]);
  let frontier: { id: string; hops: Hop[] }[] = [{ id: fromId, hops: [] }];

  while (frontier.length) {
    const next: typeof frontier = [];
    for (const { id, hops } of frontier) {
      for (const { to, hop } of graph.get(id) ?? []) {
        if (seen.has(to)) continue;
        const path = [...hops, hop];
        if (to === toId) return path;
        seen.add(to);
        next.push({ id: to, hops: path });
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * What `toId` is to `fromId`, derived from the stored direct edges.
 * Example: A parent_of B and B sibling C ⇒ deriveRelationship(edges, A, C) is "child".
 * `genderOf` is the gender of `toId` (the person being described).
 */
export function deriveRelationship(
  edges: RelationEdge[],
  fromId: string,
  toId: string,
  genderOf: (id: string) => Gender | undefined = () => undefined,
): DerivedRelation | null {
  const graph = buildGraph(edges);
  const raw = findPath(graph, fromId, toId);
  if (raw === null) return null;

  const hops = normalise(raw);
  const { base, greats } = classify(hops);
  if (base === "relative")
    return { base, label: "relative", distance: raw.length };

  const prefix = "great-".repeat(Math.max(greats, 0));
  return {
    base,
    label: `${prefix}${pick(base, genderOf(toId))}`,
    distance: raw.length,
  };
}

const WORD_TO_RELATION: Record<
  string,
  { base: RelationBase; gender?: Gender }
> = {
  mom: { base: "parent", gender: "female" },
  mommy: { base: "parent", gender: "female" },
  mum: { base: "parent", gender: "female" },
  mother: { base: "parent", gender: "female" },
  dad: { base: "parent", gender: "male" },
  daddy: { base: "parent", gender: "male" },
  papa: { base: "parent", gender: "male" },
  father: { base: "parent", gender: "male" },
  parent: { base: "parent" },
  parents: { base: "parent" },
  son: { base: "child", gender: "male" },
  daughter: { base: "child", gender: "female" },
  child: { base: "child" },
  brother: { base: "sibling", gender: "male" },
  sister: { base: "sibling", gender: "female" },
  sibling: { base: "sibling" },
  husband: { base: "spouse", gender: "male" },
  wife: { base: "spouse", gender: "female" },
  spouse: { base: "spouse" },
  partner: { base: "spouse" },
  grandfather: { base: "grandparent", gender: "male" },
  grandpa: { base: "grandparent", gender: "male" },
  grandmother: { base: "grandparent", gender: "female" },
  grandma: { base: "grandparent", gender: "female" },
  grandparent: { base: "grandparent" },
  grandson: { base: "grandchild", gender: "male" },
  granddaughter: { base: "grandchild", gender: "female" },
  grandchild: { base: "grandchild" },
  uncle: { base: "uncle_aunt", gender: "male" },
  aunt: { base: "uncle_aunt", gender: "female" },
  aunty: { base: "uncle_aunt", gender: "female" },
  nephew: { base: "niece_nephew", gender: "male" },
  niece: { base: "niece_nephew", gender: "female" },
  cousin: { base: "cousin" },
  "father-in-law": { base: "parent_in_law", gender: "male" },
  "mother-in-law": { base: "parent_in_law", gender: "female" },
  "son-in-law": { base: "child_in_law", gender: "male" },
  "daughter-in-law": { base: "child_in_law", gender: "female" },
  "brother-in-law": { base: "sibling_in_law", gender: "male" },
  "sister-in-law": { base: "sibling_in_law", gender: "female" },
};

/** True when a spoken word like "mom" or "uncle" fits a derived relation to a person of the given gender. */
export function relationWordMatches(
  word: string,
  relation: DerivedRelation,
  gender?: Gender,
): boolean {
  const spec =
    WORD_TO_RELATION[
      word
        .trim()
        .toLowerCase()
        .replace(/^(my|your)\s+/, "")
    ];
  if (!spec || spec.base !== relation.base) return false;
  return (
    !spec.gender || !gender || gender === "other" || spec.gender === gender
  );
}

/** The single graph edge implied by "invitee is <relationship> of inviter", or null (caregiver / other). */
export function edgeFromInvite(
  relationship: FamilyRelationship,
  inviterId: string,
  inviteeId: string,
): RelationEdge | null {
  switch (relationship) {
    case "son":
    case "daughter":
    case "child":
      return { kind: "parent_of", a: inviterId, b: inviteeId };
    case "parent":
      return { kind: "parent_of", a: inviteeId, b: inviterId };
    case "spouse":
      return { kind: "spouse", a: inviterId, b: inviteeId };
    case "sibling":
      return { kind: "sibling", a: inviterId, b: inviteeId };
    default:
      return null;
  }
}
