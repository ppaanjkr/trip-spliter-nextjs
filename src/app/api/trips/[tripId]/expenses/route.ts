import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createId, nowISO } from "@/lib/utils";
import { roundMoney } from "@/lib/money";
import { AddExpensePayload, Expense, ExpenseSplit } from "@/types/expense";
import { Member } from "@/types/member";

type Params = {
  params: Promise<{
    tripId: string;
  }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;

    const membersSnap = await adminDb.collection("members").get();

    const memberMap: Record<string, Member> = {};

    membersSnap.docs.forEach((m) => {
      const data = m.data();

      memberMap[m.id] = {
        memberId: m.id,
        name: data.name || "",
        avatar: data.avatar || "",
        color: data.color || "#e5e7eb",
        promptpay: data.promptpay || "",
      };
    });

    const expensesSnap = await adminDb
      .collection("trips")
      .doc(tripId)
      .collection("expenses")
      .orderBy("createdAt", "desc")
      .get();

    const expenses: Expense[] = [];

    for (const expDoc of expensesSnap.docs) {
      const expData = expDoc.data() as Expense;

      const splitsSnap = await adminDb
        .collection("trips")
        .doc(tripId)
        .collection("expenses")
        .doc(expDoc.id)
        .collection("splits")
        .get();

      const splits: ExpenseSplit[] = splitsSnap.docs.map((s) => {
        const data = s.data() as ExpenseSplit;

        return {
          memberId: data.memberId,
          amountTHB: Number(data.amountTHB || 0),
          member: memberMap[data.memberId],
        };
      });

      expenses.push({
        ...expData,
        expenseId: expDoc.id,
        payer: memberMap[expData.payerId],
        splits,
      });
    }

    return NextResponse.json(expenses);
  } catch (err) {
    console.error("GET /api/trips/[tripId]/expenses error", err);

    return NextResponse.json(
      { success: false, message: "Failed to load expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { tripId } = await params;
    const data = (await req.json()) as AddExpensePayload;

    const expenseId = createId("e");

    const amount = Number(data.amount || 0);
    const serviceCharge = Number(data.serviceCharge || 0);
    const tax = Number(data.tax || 0);
    const rate = Number(data.rate || 1);

    const total = amount + serviceCharge + tax;
    const amountTHB = roundMoney(total * rate);

    let shares: Record<string, number> = {};

    if (data.splitMode === "equal") {
      const perPerson = total / data.selectedMembers.length;

      data.selectedMembers.forEach((memberId) => {
        shares[memberId] = roundMoney(perPerson);
      });
    } else if (data.splitMode === "smart") {
      const extra = (serviceCharge + tax) / data.selectedMembers.length;

      data.selectedMembers.forEach((memberId) => {
        const food = Number(data.foodShares[memberId] || 0);
        shares[memberId] = roundMoney(food + extra);
      });
    } else {
      shares = data.customShares || {};
    }

    const expense: Expense = {
      expenseId,
      tripId,
      type: data.type,
      remark: data.remark || "",
      payerId: data.payerId,
      amount,
      serviceCharge,
      tax,
      currency: data.currency,
      rate,
      amountTHB,
      splitMode: data.splitMode,
      createdAt: nowISO(),
      splits: [],
    };

    await adminDb
      .collection("trips")
      .doc(tripId)
      .collection("expenses")
      .doc(expenseId)
      .set(expense);

    await Promise.all(
      Object.keys(shares).map((memberId) => {
        const splitTHB = roundMoney(Number(shares[memberId] || 0) * rate);

        return adminDb
          .collection("trips")
          .doc(tripId)
          .collection("expenses")
          .doc(expenseId)
          .collection("splits")
          .doc(memberId)
          .set({
            memberId,
            amountTHB: splitTHB,
          });
      })
    );

    return NextResponse.json({
      success: true,
      expenseId,
    });
  } catch (err) {
    console.error("POST /api/trips/[tripId]/expenses error", err);

    return NextResponse.json(
      { success: false, message: "Failed to add expense" },
      { status: 500 }
    );
  }
}