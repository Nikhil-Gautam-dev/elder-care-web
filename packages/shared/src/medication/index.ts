import {
  DAY_SLOTS,
  FOOD_TIMINGS,
  MEDICATION_FORMS,
  type DaySlot,
  type FoodTiming,
  type IMedication,
  type MedicationForm,
  type MedicationSupplyStatus,
} from "../types/medication.js";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** How many times a day the medicine is taken (0 for "as needed"). */
export function intakesPerDay(schedule: IMedication["schedule"]): number {
  if (schedule.asNeeded) return 0;
  return schedule.times.length || schedule.slots.length;
}

/**
 * Units on hand are the stored count (reduced only when a dose is logged, topped up on delivery);
 * "days left" is an estimate from the schedule.
 */
export function medicationSupplyStatus(
  med: Pick<IMedication, "dose" | "schedule" | "supply">,
): MedicationSupplyStatus {
  const perDay = intakesPerDay(med.schedule);
  const dailyUnits = perDay > 0 ? med.dose.amount * perDay : null;
  const unitsLeft = Math.max(
    0,
    Math.round(med.supply.unitsRemaining * 100) / 100,
  );
  const daysLeft =
    dailyUnits === null ? null : Math.floor(unitsLeft / dailyUnits);

  return {
    dailyUnits,
    unitsLeft,
    daysLeft,
    needsRefill:
      daysLeft === null
        ? unitsLeft <= 0
        : daysLeft <= med.supply.refillThresholdDays,
  };
}

/** Units left after taking `amount` (never below 0). */
export function applyDose(
  med: Pick<IMedication, "supply">,
  amount: number,
): number {
  return Math.max(
    0,
    Math.round((med.supply.unitsRemaining - amount) * 100) / 100,
  );
}

/** Packs to buy to cover `days` of use (at least 1). */
export function packsForDays(
  med: Pick<IMedication, "dose" | "schedule" | "supply">,
  days: number,
): number {
  const { dailyUnits } = medicationSupplyStatus(med);
  if (dailyUnits === null) return 1;
  return Math.max(1, Math.ceil((dailyUnits * days) / med.supply.unitsPerPack));
}

const SLOT_WORDS: Record<DaySlot, string> = {
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
};

const FOOD_WORDS: Record<FoodTiming, string> = {
  before: "before food",
  after: "after food",
  with: "with food",
  any: "",
};

const joinWords = (words: string[]) =>
  words.length <= 1
    ? (words[0] ?? "")
    : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;

/** "1 tablet in the morning and night, after food" — plain language for people and the assistant. */
export function describeMedication(
  med: Pick<IMedication, "dose" | "schedule">,
): string {
  const { dose, schedule } = med;
  const amount = `${dose.amount} ${dose.unit}`.trim();
  let when: string;
  if (schedule.asNeeded) when = "only when needed";
  else if (schedule.times.length) when = `at ${joinWords(schedule.times)}`;
  else when = `in the ${joinWords(schedule.slots.map((s) => SLOT_WORDS[s]))}`;

  const food = FOOD_WORDS[schedule.food];
  return [`${amount} ${when}`, food, schedule.instructions]
    .filter(Boolean)
    .join(", ");
}

type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

const fail = (error: string): { ok: false; error: string } => ({
  ok: false,
  error,
});
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function text(value: unknown, field: string, max: number): Validated<string> {
  if (typeof value !== "string" || !value.trim())
    return fail(`${field} must be some text`);
  if (value.trim().length > max)
    return fail(`${field} is too long (max ${max} characters)`);
  return { ok: true, value: value.trim() };
}

function date(value: unknown, field: string): Validated<Date> {
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? fail(`${field} is not a valid date`)
    : { ok: true, value: parsed };
}

/** Normalised medication fields; nested objects may be partial when validating an update. */
export interface MedicationFields {
  name?: string;
  genericName?: string;
  strength?: string;
  form?: MedicationForm;
  dose?: { amount?: number; unit?: string };
  schedule?: {
    slots?: DaySlot[];
    times?: string[];
    food?: FoodTiming;
    asNeeded?: boolean;
    instructions?: string;
  };
  supply?: {
    unitsPerPack?: number;
    unitsRemaining?: number;
    refillThresholdDays?: number;
  };
  prescribedBy?: string;
  startDate?: Date;
  endDate?: Date | null;
  active?: boolean;
}

/**
 * Validates and normalises a medication payload (shared by the REST api and the MCP tools).
 * `create` requires the essentials; `update` accepts any subset.
 */
export function validateMedicationInput(
  input: unknown,
  mode: "create" | "update",
): Validated<MedicationFields> {
  if (!isObject(input)) return fail("Medication details are required");
  const out: MedicationFields = {};
  const create = mode === "create";

  if (create || input["name"] !== undefined) {
    const r = text(input["name"], "name", 80);
    if (!r.ok) return r;
    out.name = r.value;
  }
  if (
    input["genericName"] !== undefined &&
    input["genericName"] !== null &&
    input["genericName"] !== ""
  ) {
    const r = text(input["genericName"], "genericName", 80);
    if (!r.ok) return r;
    out.genericName = r.value;
  }
  if (create || input["strength"] !== undefined) {
    const r = text(input["strength"], "strength", 30);
    if (!r.ok) return r;
    out.strength = r.value;
  }
  if (create || input["form"] !== undefined) {
    if (!MEDICATION_FORMS.includes(input["form"] as MedicationForm)) {
      return fail(`form must be one of ${MEDICATION_FORMS.join(", ")}`);
    }
    out.form = input["form"] as MedicationForm;
  }

  const dose = input["dose"];
  if (create || dose !== undefined) {
    if (!isObject(dose))
      return fail("dose is required, e.g. { amount: 1, unit: 'tablet' }");
    out.dose = {};
    if (create || dose["amount"] !== undefined) {
      const amount = Number(dose["amount"]);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100) {
        return fail("dose.amount must be a number between 0 and 100");
      }
      out.dose.amount = amount;
    }
    if (dose["unit"] !== undefined || create) {
      const r = text(dose["unit"] ?? "unit", "dose.unit", 20);
      if (!r.ok) return r;
      out.dose.unit = r.value;
    }
  }

  const schedule = input["schedule"];
  if (create || schedule !== undefined) {
    if (!isObject(schedule)) return fail("schedule is required");
    out.schedule = {};
    if (schedule["slots"] !== undefined) {
      const slots = schedule["slots"];
      if (
        !Array.isArray(slots) ||
        !slots.every((s) => DAY_SLOTS.includes(s as DaySlot))
      ) {
        return fail(`schedule.slots must be a list of ${DAY_SLOTS.join(", ")}`);
      }
      out.schedule.slots = [...new Set(slots as DaySlot[])];
    }
    if (schedule["times"] !== undefined) {
      const times = schedule["times"];
      if (
        !Array.isArray(times) ||
        !times.every((t) => typeof t === "string" && TIME_PATTERN.test(t))
      ) {
        return fail("schedule.times must be 24-hour HH:mm values like 08:00");
      }
      out.schedule.times = [...new Set(times as string[])].sort();
    }
    if (schedule["food"] !== undefined) {
      if (!FOOD_TIMINGS.includes(schedule["food"] as FoodTiming)) {
        return fail(`schedule.food must be one of ${FOOD_TIMINGS.join(", ")}`);
      }
      out.schedule.food = schedule["food"] as FoodTiming;
    }
    if (schedule["asNeeded"] !== undefined) {
      if (typeof schedule["asNeeded"] !== "boolean")
        return fail("schedule.asNeeded must be true or false");
      out.schedule.asNeeded = schedule["asNeeded"];
    }
    if (
      schedule["instructions"] !== undefined &&
      schedule["instructions"] !== ""
    ) {
      const r = text(schedule["instructions"], "schedule.instructions", 200);
      if (!r.ok) return r;
      out.schedule.instructions = r.value;
    }
    if (
      create &&
      !out.schedule.asNeeded &&
      !out.schedule.slots?.length &&
      !out.schedule.times?.length
    ) {
      return fail(
        "Say when it is taken (slots or times), or mark it as needed only",
      );
    }
  }

  const supply = input["supply"];
  if (create || supply !== undefined) {
    if (!isObject(supply))
      return fail("supply is required, e.g. { unitsPerPack: 10 }");
    out.supply = {};
    if (create || supply["unitsPerPack"] !== undefined) {
      const n = Number(supply["unitsPerPack"]);
      if (!Number.isInteger(n) || n < 1 || n > 1000)
        return fail(
          "supply.unitsPerPack must be a whole number from 1 to 1000",
        );
      out.supply.unitsPerPack = n;
    }
    if (supply["unitsRemaining"] !== undefined) {
      const n = Number(supply["unitsRemaining"]);
      if (!Number.isFinite(n) || n < 0 || n > 100000)
        return fail("supply.unitsRemaining must be 0 or more");
      out.supply.unitsRemaining = n;
    }
    if (supply["refillThresholdDays"] !== undefined) {
      const n = Number(supply["refillThresholdDays"]);
      if (!Number.isInteger(n) || n < 0 || n > 60)
        return fail(
          "supply.refillThresholdDays must be a whole number from 0 to 60",
        );
      out.supply.refillThresholdDays = n;
    }
  }

  if (input["prescribedBy"] !== undefined && input["prescribedBy"] !== "") {
    const r = text(input["prescribedBy"], "prescribedBy", 80);
    if (!r.ok) return r;
    out.prescribedBy = r.value;
  }
  if (input["startDate"] !== undefined && input["startDate"] !== "") {
    const r = date(input["startDate"], "startDate");
    if (!r.ok) return r;
    out.startDate = r.value;
  }
  if (input["endDate"] !== undefined) {
    if (input["endDate"] === null || input["endDate"] === "")
      out.endDate = null;
    else {
      const r = date(input["endDate"], "endDate");
      if (!r.ok) return r;
      out.endDate = r.value;
    }
  }
  if (out.startDate && out.endDate && out.endDate < out.startDate) {
    return fail("endDate cannot be before startDate");
  }
  if (input["active"] !== undefined) {
    if (typeof input["active"] !== "boolean")
      return fail("active must be true or false");
    out.active = input["active"];
  }

  return { ok: true, value: out };
}

type MedicationShape = Pick<
  IMedication,
  | "name"
  | "strength"
  | "form"
  | "dose"
  | "schedule"
  | "supply"
  | "startDate"
  | "active"
> &
  Partial<Pick<IMedication, "genericName" | "prescribedBy" | "endDate">>;

const DEFAULT_REFILL_THRESHOLD_DAYS = 5;

const dropUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;

/** Full medication fields (defaults applied, `undefined`s omitted) from a validated `create` payload. */
export function buildMedication(
  v: MedicationFields,
  now: Date = new Date(),
): MedicationShape {
  return dropUndefined({
    name: v.name!,
    genericName: v.genericName,
    strength: v.strength!,
    form: v.form!,
    dose: { amount: v.dose!.amount!, unit: v.dose!.unit! },
    schedule: dropUndefined({
      slots: v.schedule?.slots ?? [],
      times: v.schedule?.times ?? [],
      food: v.schedule?.food ?? "any",
      asNeeded: v.schedule?.asNeeded ?? false,
      instructions: v.schedule?.instructions,
    }),
    supply: {
      unitsPerPack: v.supply!.unitsPerPack!,
      unitsRemaining: v.supply?.unitsRemaining ?? 0,
      asOf: now,
      refillThresholdDays:
        v.supply?.refillThresholdDays ?? DEFAULT_REFILL_THRESHOLD_DAYS,
    },
    prescribedBy: v.prescribedBy,
    startDate: v.startDate ?? now,
    endDate: v.endDate ?? undefined,
    active: true,
  }) as MedicationShape;
}

/** Applies a validated `update` payload to an existing medication and re-checks the result. */
export function mergeMedication<T extends MedicationShape>(
  existing: T,
  v: MedicationFields,
  now: Date = new Date(),
): Validated<T> {
  const next: T = {
    ...existing,
    name: v.name ?? existing.name,
    genericName: v.genericName ?? existing.genericName,
    strength: v.strength ?? existing.strength,
    form: v.form ?? existing.form,
    dose: { ...existing.dose, ...v.dose },
    schedule: { ...existing.schedule, ...v.schedule },
    supply: {
      ...existing.supply,
      ...v.supply,
      // Changing the count means "this is how many I have now".
      asOf: v.supply?.unitsRemaining !== undefined ? now : existing.supply.asOf,
    },
    prescribedBy: v.prescribedBy ?? existing.prescribedBy,
    startDate: v.startDate ?? existing.startDate,
    active: v.active ?? existing.active,
  };
  if (v.endDate !== undefined) next.endDate = v.endDate ?? undefined;

  if (next.endDate && next.endDate < next.startDate)
    return fail("endDate cannot be before startDate");
  if (
    !next.schedule.asNeeded &&
    !next.schedule.slots.length &&
    !next.schedule.times.length
  ) {
    return fail(
      "Say when it is taken (slots or times), or mark it as needed only",
    );
  }
  return { ok: true, value: next };
}
