import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Member } from "@/types/member";
import { Trip } from "@/types/trip";

type Params = {
  params: Promise<{
    tripId: string;
  }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;

    const tripSnap = await adminDb.collection("trips").doc(tripId).get();

    if (!tripSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    const trip = tripSnap.data() as Trip;

    const membersSnap = await adminDb.collection("members").get();

    const allMembers: Member[] = membersSnap.docs.map((m) => {
      const data = m.data();

      return {
        memberId: m.id,
        name: data.name || "",
        avatar: data.avatar || "",
        color: data.color || "#e5e7eb",
        promptpay: data.promptpay || "",
      };
    });

    const members = allMembers.filter((m) =>
      (trip.memberIds || []).includes(m.memberId)
    );

    return NextResponse.json({
      ...trip,
      tripId,
      members,
    });
  } catch (err) {
    console.error("GET /api/trips/[tripId] error", err);

    return NextResponse.json(
      { success: false, message: "Failed to load trip" },
      { status: 500 }
    );
  }
}