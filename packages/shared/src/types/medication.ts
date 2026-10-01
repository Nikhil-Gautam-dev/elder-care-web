export const MEDICATION_FORMS = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "drops",
  "inhaler",
  "ointment",
  "other",
] as const;
export type MedicationForm = (typeof MEDICATION_FORMS)[number];

export const FOOD_TIMINGS = ["before", "after", "with", "any"] as const;
export type FoodTiming = (typeof FOOD_TIMINGS)[number];

export const DAY_SLOTS = ["morning", "afternoon", "evening", "night"] as const;
export type DaySlot = (typeof DAY_SLOTS)[number];

export interface MedicationDose {
  /** Amount taken per intake, e.g. 1 (tablet) or 5 (ml). */
  amount: number;
  unit: string;
}

export interface MedicationSchedule {
  /** Parts of the day the medicine is taken. */
  slots: DaySlot[];
  /** Optional exact times (HH:mm) when the schedule is more specific than `slots`. */
  times: string[];
  food: FoodTiming;
  /** Taken only when needed (e.g. for pain) — no fixed daily usage. */
  asNeeded: boolean;
  instructions?: string;
}

export interface MedicationSupply {
  unitsPerPack: number;
  /** Units (tablets, ml…) on hand: reduced when a dose is logged, topped up on delivery. */
  unitsRemaining: number;
  /** When `unitsRemaining` was last set directly (creation or manual correction). */
  asOf: Date;
  /** Order again when this many days of supply are left. */
  refillThresholdDays: number;
}

export interface IMedication {
  _id: string;
  elderId: string;
  /** Name as prescribed or as the family knows it, e.g. "Metformin". */
  name: string;
  genericName?: string;
  strength: string;
  form: MedicationForm;
  dose: MedicationDose;
  schedule: MedicationSchedule;
  supply: MedicationSupply;
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Computed from supply + schedule; never stored. */
export interface MedicationSupplyStatus {
  dailyUnits: number | null;
  unitsLeft: number;
  daysLeft: number | null;
  needsRefill: boolean;
}

export interface IMedicationView extends IMedication {
  supplyStatus: MedicationSupplyStatus;
  /** Plain-language summary, e.g. "1 tablet in the morning and night, after food". */
  summary: string;
}

export interface CreateMedicationBody {
  /** Defaults to the signed-in user. */
  elderId?: string;
  name: string;
  genericName?: string;
  strength: string;
  form: MedicationForm;
  dose: MedicationDose;
  schedule: Partial<MedicationSchedule>;
  supply: Partial<MedicationSupply> & Pick<MedicationSupply, "unitsPerPack">;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateMedicationBody {
  name?: string;
  genericName?: string;
  strength?: string;
  form?: MedicationForm;
  dose?: Partial<MedicationDose>;
  schedule?: Partial<MedicationSchedule>;
  supply?: Partial<Omit<MedicationSupply, "asOf">>;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string | null;
  active?: boolean;
}

/** One recorded intake; reduces `supply.unitsRemaining` by `amount` (restored if undone). */
export interface IDoseLog {
  _id: string;
  medicationId: string;
  elderId: string;
  amount: number;
  takenAt: Date;
  loggedBy: string;
  undoneAt?: Date;
  undoneBy?: string;
}

export interface LogDoseBody {
  /** Defaults to the medication's standard dose. */
  amount?: number;
  /** Client-generated id so a retried request never double-counts. */
  requestId?: string;
}

export type PharmacyOrderStatus =
  | "placed"
  | "accepted"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";

export interface IPharmacyOrderItem {
  medicationId?: string;
  catalogItemId: string;
  brand: string;
  generic: string;
  strength: string;
  packs: number;
  packSize: number;
  packUnit: string;
  pricePerPack: number;
}

/** ElderCare's own record of an order placed at the pharmacy (the pharmacy holds the source of truth). */
export interface IPharmacyOrder {
  _id: string;
  pharmacyOrderId: string;
  orderNumber: string;
  elderId: string;
  orderedBy: string;
  orderedByName: string;
  items: IPharmacyOrderItem[];
  total: number;
  status: PharmacyOrderStatus;
  statusUpdatedAt: Date;
  suppliesApplied: boolean;
  createdAt: Date;
}
