import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Member } from "@/types/member";

export async function GET() {
  try {
    const snap = await adminDb
      .collection("members")
      .orderBy("name", "asc")
      .get();

    const members: Member[] = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        memberId: doc.id,
        name: data.name || "",
        avatar: data.avatar || "",
        color: data.color || "#e5e7eb",
        promptpay: data.promptpay || "",
      };
    });

    return NextResponse.json(members);
  } catch (err) {
    console.error("GET /api/members error", err);

    return NextResponse.json(
      { success: false, message: "Failed to load members" },
      { status: 500 }
    );
  }
}