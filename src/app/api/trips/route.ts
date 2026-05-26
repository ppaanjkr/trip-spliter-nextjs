import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createId, nowISO } from "@/lib/utils";
import { Trip, TripWithSummary } from "@/types/trip";
import { Expense } from "@/types/expense";
import { Member } from "@/types/member";
import { roundMoney } from "@/lib/money";

export async function GET() {
  try {
    const membersSnap = await adminDb.collection("members").get();

    const memberMap: Record<string, Member> = {};

    membersSnap.docs.forEach((doc) => {
      const data = doc.data();

      memberMap[doc.id] = {
        memberId: doc.id,
        name: data.name || "",
        avatar: data.avatar || "",
        color: data.color || "#e5e7eb",
        promptpay: data.promptpay || "",
      };
    });

    const tripsSnap = await adminDb
      .collection("trips")
      .orderBy("createdAt", "desc")
      .get();

    const trips: TripWithSummary[] = [];

    for (const tripDoc of tripsSnap.docs) {
      const data = tripDoc.data() as Trip;

      const expensesSnap = await adminDb
        .collection("trips")
        .doc(tripDoc.id)
        .collection("expenses")
        .get();

      const totalTHB = expensesSnap.docs.reduce((sum, expDoc) => {
        const exp = expDoc.data() as Expense;
        return sum + Number(exp.amountTHB || 0);
      }, 0);

      const memberNames = (data.memberIds || []).map(
        (id) => memberMap[id]?.name || id
      );

      trips.push({
        tripId: tripDoc.id,
        tripName: data.tripName,
        currency: data.currency,
        status: data.status,
        memberIds: data.memberIds || [],
        createdAt: data.createdAt,
        closedAt: data.closedAt || null,
        members: memberNames,
        totalTHB: roundMoney(totalTHB),
      });
    }

    return NextResponse.json(trips);
  } catch (err) {
    console.error("GET /api/trips error", err);

    return NextResponse.json(
      { success: false, message: "Failed to load trips" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const tripName = body.tripName;
    const currency = body.currency || "THB";
    const memberIds = body.memberIds || [];

    if (!tripName) {
      return NextResponse.json(
        { success: false, message: "Trip name is required" },
        { status: 400 }
      );
    }

    if (!memberIds.length) {
      return NextResponse.json(
        { success: false, message: "Please select members" },
        { status: 400 }
      );
    }

    const tripId = createId("t");

    const trip: Trip = {
      tripId,
      tripName,
      currency,
      status: "active",
      memberIds,
      createdAt: nowISO(),
      closedAt: null,
    };

    await adminDb.collection("trips").doc(tripId).set(trip);

    return NextResponse.json({
      success: true,
      tripId,
    });
  } catch (err) {
    console.error("POST /api/trips error", err);

    return NextResponse.json(
      { success: false, message: "Failed to create trip" },
      { status: 500 }
    );
  }
}