export const RIDE_STATUSES = [
  "requested",
  "accepted",
  "arriving",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
] as const;

export type RideStatus = (typeof RIDE_STATUSES)[number];

/** Statuses after which a ride never changes again. */
export const FINAL_RIDE_STATUSES: readonly RideStatus[] = [
  "completed",
  "rejected",
  "cancelled",
];

/** A ride stops being cancellable once the trip has started. */
export const CANCELLABLE_RIDE_STATUSES: readonly RideStatus[] = [
  "requested",
  "accepted",
  "arriving",
];

export interface IRideDriver {
  name: string;
  vehicle: string;
  plate: string;
}

/** The ElderCare-side record of a booked ride (`rides` collection in the MCP database). */
export interface IRide {
  id: string;
  rideId: string;
  rideNumber: string;
  elderId: string;
  bookedBy: string;
  bookedByName: string;
  pickup: string;
  drop: string;
  scheduledAt: Date | null;
  notes?: string;
  fareEstimate: number;
  status: RideStatus;
  driver?: IRideDriver;
  rejectionReason?: string;
  statusUpdatedAt: Date;
  createdAt: Date;
}
