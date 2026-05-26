import Link from "next/link";
import { TripWithSummary } from "@/types/trip";
import { formatMoney } from "@/lib/money";

type TripCardProps = {
  trip: TripWithSummary;
};

export default function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trips/${trip.tripId}`}>
      <div className="old-card">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base text-[#2D3135]">
              {trip.tripName}
            </div>

            <div className="old-sub mt-1 line-clamp-2 text-sm">
              {trip.members?.length ? trip.members.join(", ") : "-"}
            </div>
          </div>

          <div className="shrink-0 text-center">
            <div className="text-base text-[#2D3135]">
              {formatMoney(trip.totalTHB)}
            </div>
            <div className="old-sub text-xs">THB</div>
          </div>
        </div>
      </div>
    </Link>
  );
}