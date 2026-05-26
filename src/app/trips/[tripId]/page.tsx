"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";

import LoadingOverlay from "@/components/common/LoadingOverlay";
import Modal from "@/components/common/Modal";
import Toast from "@/components/common/Toast";

import TripTabs, { TabType } from "@/components/trips/TripTabs";
import ExpenseList from "@/components/trips/ExpenseList";
import SettleList, {
  SettlementTransaction,
} from "@/components/trips/SettleList";
import SummaryList from "@/components/trips/SummaryList";

import { formatMoney, roundMoney } from "@/lib/money";
import { Expense } from "@/types/expense";
import { Member } from "@/types/member";
import { Trip } from "@/types/trip";

type TripDetail = Trip & {
  members: Member[];
};

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("expenses");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Notice");
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmText, setModalConfirmText] = useState("OK");
  const [modalShowCancel, setModalShowCancel] = useState(false);
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);

  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("Copied PromptPay");

  const isActive = trip?.status === "active";

  const totalTHB = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amountTHB || 0), 0);
  }, [expenses]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [expenses]);

  const settlementTransactions = useMemo(() => {
    return calculatePairwiseDebts(expenses).sort((a, b) => {
      const fromA = getMemberName(a.from);
      const fromB = getMemberName(b.from);

      if (fromA !== fromB) return fromA.localeCompare(fromB);

      const toA = getMemberName(a.to);
      const toB = getMemberName(b.to);

      return toA.localeCompare(toB);
    });
  }, [expenses, trip]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [tripRes, expensesRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`),
          fetch(`/api/trips/${tripId}/expenses`),
        ]);

        const tripData = await tripRes.json();
        const expensesData = await expensesRes.json();

        if (!ignore) {
          if (tripData?.success === false) {
            setTrip(null);
          } else {
            setTrip(tripData);
          }

          setExpenses(Array.isArray(expensesData) ? expensesData : []);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          showInfoModal("Error", "Failed to load data");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [tripId]);

  function showInfoModal(title: string, message: string) {
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmText("OK");
    setModalShowCancel(false);
    setModalAction(null);
    setModalOpen(true);
  }

  function showConfirmModal(
    message: string,
    onConfirm: () => void,
    title = "Confirm",
  ) {
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmText("Confirm");
    setModalShowCancel(true);
    setModalAction(() => onConfirm);
    setModalOpen(true);
  }

  function handleModalConfirm() {
    setModalOpen(false);

    if (modalAction) {
      modalAction();
    }
  }

  function getMemberName(id: string) {
    const m = trip?.members?.find((x) => x.memberId === id);
    return m ? m.name : id;
  }

  function getMemberPromptPay(id: string) {
    const m = trip?.members?.find((x) => x.memberId === id);
    return m?.promptpay || "";
  }

  function calculatePairwiseDebts(expenseList: Expense[]) {
    const debts: Record<string, number> = {};

    expenseList.forEach((e) => {
      const payer = e.payerId;

      (e.splits || []).forEach((s) => {
        if (s.memberId === payer) return;

        const key = `${s.memberId}|${payer}`;

        if (!debts[key]) debts[key] = 0;

        debts[key] += Number(s.amountTHB || 0);
      });
    });

    const result: SettlementTransaction[] = [];

    Object.keys(debts).forEach((key) => {
      const [from, to] = key.split("|");
      const reverseKey = `${to}|${from}`;

      const forward = debts[key] || 0;
      const backward = debts[reverseKey] || 0;

      const net = roundMoney(forward - backward);

      if (net > 0) {
        result.push({
          from,
          to,
          amount: net,
        });
      }
    });

    return result;
  }

  async function closeTrip() {
    showConfirmModal("End trip?", async () => {
      try {
        setActionLoading(true);

        const res = await fetch(`/api/trips/${tripId}/close`, {
          method: "PATCH",
        });

        const data = await res.json();

        if (!data.success) {
          showInfoModal("Error", data.message || "Error");
          return;
        }

        setTrip((prev) =>
          prev
            ? {
                ...prev,
                status: "closed",
                closedAt: new Date().toISOString(),
              }
            : prev,
        );

        showInfoModal("Success", "Trip closed!");
      } catch (err) {
        console.error(err);
        showInfoModal("Error", "Something went wrong");
      } finally {
        setActionLoading(false);
      }
    });
  }

  async function deleteExpense(expenseId: string) {
    showConfirmModal("Delete?", async () => {
      try {
        setActionLoading(true);

        const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!data.success) {
          showInfoModal("Error", data.message || "Error");
          return;
        }

        setExpenses((prev) => prev.filter((e) => e.expenseId !== expenseId));
      } catch (err) {
        console.error(err);
        showInfoModal("Error", "Something went wrong");
      } finally {
        setActionLoading(false);
      }
    });
  }

  async function copyPromptPay(text: string) {
    try {
      if (!text) {
        setToastMessage("No PromptPay");
      } else {
        await navigator.clipboard.writeText(text);
        setToastMessage("Copied PromptPay");
      }
    } catch {
      setToastMessage("Copy failed");
    }

    setToastShow(true);

    setTimeout(() => {
      setToastShow(false);
    }, 1800);
  }

  if (loading) {
    return (
      <main className="page-shell">
        <LoadingOverlay />
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="page-shell">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/trips")}
            className="cursor-pointer border-0 bg-transparent pt-2 text-[#2D3135]"
          >
            <ChevronLeft size={24} strokeWidth={1} />
          </button>

          <h2 className="text-lg font-normal text-[#2D3135]">Trip</h2>
        </div>

        <div className="empty">Trip not found</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      {actionLoading && <LoadingOverlay />}

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/trips")}
          className="cursor-pointer border-0 bg-transparent text-[#2D3135]"
        >
          <ChevronLeft size={24} strokeWidth={1} />
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-normal text-[#2D3135]">
            {trip.tripName || "Trip"}
          </h2>
        </div>
      </div>

      <div className="mb-4.5 mt-3 flex justify-between gap-3">
        <div className="text-lg">
          {trip.members?.map((m) => m.avatar).join(" ")}
        </div>

        <div className="font-semibold text-[#2D3135]">
          {formatMoney(totalTHB)} THB
        </div>
      </div>

      {isActive && (
        <button
          type="button"
          onClick={closeTrip}
          className="mb-4 w-full rounded-2xl border border-[#E8E6E1] bg-white p-4 text-base text-[#2D3135]"
        >
          End Trip
        </button>
      )}

      <TripTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "expenses" && isActive && (
        <button
          type="button"
          onClick={() => router.push(`/trips/${tripId}/expenses/create`)}
          className="mb-4 w-full rounded-2xl border-0 bg-[#ffe4ef] p-4 text-base text-[#2D3135] flex items-center gap-2 justify-center"
        >
          <Plus width={16} height={16} /> Add Expense
        </button>
      )}

      {activeTab === "expenses" && (
        <ExpenseList
          expenses={sortedExpenses}
          isActive={isActive}
          onDelete={deleteExpense}
          getMemberName={getMemberName}
        />
      )}

      {activeTab === "settle" && (
        <SettleList
          transactions={settlementTransactions}
          getMemberName={getMemberName}
          getMemberPromptPay={getMemberPromptPay}
          onCopyPromptPay={copyPromptPay}
        />
      )}

      {activeTab === "summary" && (
        <SummaryList expenses={expenses} totalTHB={totalTHB} />
      )}

      <Modal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        confirmText={modalConfirmText}
        showCancel={modalShowCancel}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <Toast show={toastShow} message={toastMessage} />
    </main>
  );
}