"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, CircleX, Plus } from "lucide-react";
import Loading from "@/components/common/Loading";
import TripCard from "@/components/trips/TripCard";
import { TripWithSummary } from "@/types/trip";
import LoadingOverlay from "@/components/common/LoadingOverlay";

export default function TripsPage() {
  const [trips, setTrips] = useState<TripWithSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchTrips() {
      try {
        const res = await fetch("/api/trips");
        const data = await res.json();

        const sorted = Array.isArray(data)
          ? data.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
          : [];

        if (!ignore) setTrips(sorted);
      } catch (err) {
        console.error(err);
        if (!ignore) setTrips([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchTrips();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="page-shell">
      {loading && <LoadingOverlay />}
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-[#ffe4ef] p-3 text-xl">
          <Plane size={20} stroke="#ff6fa5" strokeWidth={1} />
        </div>
        <h1 className="text-3xl font-normal text-[#2D3135]">Trips</h1>
      </div>

      <Link href="/trips/create">
        <button className="old-btn-primary flex items-center gap-2 justify-center">
          <Plus width={16} height={16} /> Create Trip
        </button>
      </Link>

      {trips && trips.length > 0 ? (
        <div>
          {trips.map((trip) => (
            <TripCard key={trip.tripId} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="mt-24 text-center text-[#71767A]">
          {/* <CircleX
            size={42}
            stroke="#71767A"
            strokeWidth={1}
            className="mx-auto mb-2"
          />
          <div className="text-lg">No trips</div> */}
        </div>
      )}
    </main>
  );
}
