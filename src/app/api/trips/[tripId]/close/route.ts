import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { nowISO } from "@/lib/utils";

type Params = {
  params: Promise<{
    tripId: string;
  }>;
};

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;

    await adminDb.collection("trips").doc(tripId).update({
      status: "closed",
      closedAt: nowISO(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("PATCH /api/trips/[tripId]/close error", err);

    return NextResponse.json(
      { success: false, message: "Failed to close trip" },
      { status: 500 }
    );
  }
}