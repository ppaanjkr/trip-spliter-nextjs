import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

type Params = {
  params: Promise<{
    tripId: string;
    expenseId: string;
  }>;
};

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { tripId, expenseId } = await params;

    const expenseRef = adminDb
      .collection("trips")
      .doc(tripId)
      .collection("expenses")
      .doc(expenseId);

    const splitsSnap = await expenseRef.collection("splits").get();

    await Promise.all(
      splitsSnap.docs.map((s) => s.ref.delete())
    );

    await expenseRef.delete();

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("DELETE /api/trips/[tripId]/expenses/[expenseId] error", err);

    return NextResponse.json(
      { success: false, message: "Failed to delete expense" },
      { status: 500 }
    );
  }
}