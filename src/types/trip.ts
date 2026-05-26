export type TripStatus = "active" | "closed";

export type Trip = {
  tripId: string;
  tripName: string;
  currency: string;
  status: TripStatus;
  memberIds: string[];
  createdAt: string;
  closedAt?: string | null;
};

export type TripWithSummary = Trip & {
  members: string[];
  totalTHB: number;
};