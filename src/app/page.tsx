"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import { TripWithSummary } from "@/types/trip";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/trips");
        const trips: TripWithSummary[] = await res.json();

        const activeTrip = trips.find((t) => t.status === "active");

        if (activeTrip) {
          router.replace(`/trips/${activeTrip.tripId}`);
        } else {
          router.replace("/trips");
        }
      } catch {
        router.replace("/trips");
      }
    }

    init();
  }, [router]);

  return (
    <main className="page-shell">
      {/* <Loading text="Opening trip..." /> */}
    </main>
  );
}