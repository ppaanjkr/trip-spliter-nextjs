"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import LoadingOverlay from "@/components/common/LoadingOverlay";
import Modal from "@/components/common/Modal";

import ExpenseTypeGrid from "@/components/expense/ExpenseTypeGrid";
import SplitMemberGrid from "@/components/expense/SplitMemberGrid";
import CustomSplitBox from "@/components/expense/CustomSplitBox";

import { expenseTypes } from "@/data/expense-types";
import { Member } from "@/types/member";
import { Trip } from "@/types/trip";

type TripDetail = Trip & {
  members: Member[];
};

type SplitType = "equal" | "custom";

export default function AddExpensePage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);

  const [selectedType, setSelectedType] = useState("food");
  const [remark, setRemark] = useState("");
  const [payerId, setPayerId] = useState("");

  const [amount, setAmount] = useState("");
  const [service, setService] = useState("");
  const [vat, setVat] = useState("");

  const [tripCurrency, setTripCurrency] = useState("THB");
  const [currency, setCurrency] = useState("THB");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rate, setRate] = useState("1");

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [rateLoading, setRateLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Notice");
  const [modalMessage, setModalMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const members = trip?.members || [];

  const currencyList = useMemo(() => {
    return tripCurrency === "THB" ? ["THB"] : [tripCurrency, "THB"];
  }, [tripCurrency]);

  useEffect(() => {
    let ignore = false;

    async function loadTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();

        if (ignore) return;

        if (data?.success === false) {
          showModal("Error", data.message || "Trip not found");
          return;
        }

        setTrip(data);

        const mainCurrency = String(data.currency || "THB").toUpperCase();

        setTripCurrency(mainCurrency);
        setCurrency(mainCurrency);

        // const ids = (data.members || []).map((m: Member) => m.memberId);

        // if (ids.length > 0) {
        //   setPayerId(ids[0]);
        // }

        if (mainCurrency === "THB") {
          setExchangeRate(1);
          setRate("1");
        } else {
          await loadExchangeRate(mainCurrency);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) showModal("Error", "Failed to load trip");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTrip();

    return () => {
      ignore = true;
    };
  }, [tripId]);

  function showModal(title: string, message: string, isSuccess = false) {
    setModalTitle(title);
    setModalMessage(message);
    setSuccess(isSuccess);
    setModalOpen(true);
  }

  function getRateCacheKey(currencyCode: string) {
    const now = new Date();
    const hour = now.getHours();
    const period = hour < 18 ? "before-18" : "after-18";

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    return `exchangeRate:${currencyCode}:${y}-${m}-${d}:${period}`;
  }

  async function loadExchangeRate(currencyCode: string) {
    const code = currencyCode.toUpperCase();

    if (!code || code === "THB") {
      setExchangeRate(1);
      setRate("1");
      return;
    }

    try {
      setRateLoading(true);

      const cacheKey = getRateCacheKey(code);
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        const cachedRate = Number(parsed.rate || 1);

        setExchangeRate(cachedRate);
        setRate(String(cachedRate));
        return;
      }

      const res = await fetch(`/api/exchange-rate?currency=${code}`);
      const data = await res.json();

      if (!data.success) {
        showModal("Error", data.message || "Failed to get exchange rate");
        setExchangeRate(1);
        setRate("1");
        return;
      }

      const apiRate = Number(data.rate || 1);

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          rate: apiRate,
          period: data.period,
          currency: code,
          savedAt: new Date().toISOString(),
        }),
      );

      setExchangeRate(apiRate);
      setRate(String(apiRate));
    } catch (err) {
      console.error(err);
      showModal("Error", "Failed to get exchange rate");
      setExchangeRate(1);
      setRate("1");
    } finally {
      setRateLoading(false);
    }
  }

  async function handleCurrencyChange(value: string) {
    const code = value.toUpperCase();

    setCurrency(code);

    if (code === "THB") {
      setRate("1");
      return;
    }

    await loadExchangeRate(code);
  }

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  function updateCustomShare(memberId: string, value: string) {
    setCustomShares((prev) => ({
      ...prev,
      [memberId]: value,
    }));
  }

  function validateSplit(total: number) {
    if (splitType === "equal") {
      return { ok: true, message: "" };
    }

    const serviceNum = Number(service || 0);
    const vatNum = Number(vat || 0);
    const extraPerPerson = (serviceNum + vatNum) / selectedMembers.length;

    let sum = 0;

    selectedMembers.forEach((id) => {
      sum += Number(customShares[id] || 0) + extraPerPerson;
    });

    const roundedSum = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(total * 100) / 100;

    if (roundedSum !== roundedTotal) {
      return {
        ok: false,
        message: `Total mismatch (${roundedSum} ≠ ${roundedTotal})`,
      };
    }

    return { ok: true, message: "" };
  }

  async function saveExpense() {
    try {
      const amountNum = Number(amount || 0);
      const serviceNum = Number(service || 0);
      const vatNum = Number(vat || 0);
      const total = amountNum + serviceNum + vatNum;

      if (!payerId) {
        showModal("Notice", "Select who paid");
        return;
      }

      if (!amountNum) {
        showModal("Notice", "Enter amount");
        return;
      }

      if (selectedMembers.length === 0) {
        showModal("Notice", "Select members");
        return;
      }

      if (currency !== "THB" && !Number(rate || 0)) {
        showModal("Notice", "Enter exchange rate");
        return;
      }

      const validation = validateSplit(total);

      if (!validation.ok) {
        showModal("Notice", validation.message);
        return;
      }

      const foodShares: Record<string, number> = {};

      if (splitType === "equal") {
        const share = amountNum / selectedMembers.length;

        selectedMembers.forEach((id) => {
          foodShares[id] = share;
        });
      } else {
        selectedMembers.forEach((id) => {
          foodShares[id] = Number(customShares[id] || 0);
        });
      }

      setSaving(true);

      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType,
          remark,
          payerId,
          amount: amountNum,
          serviceCharge: serviceNum,
          tax: vatNum,
          currency,
          rate: Number(rate || 1),
          splitMode: "smart",
          selectedMembers,
          foodShares,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        showModal("Error", result.message || "Error");
        return;
      }

      showModal("Success", "Added!", true);
    } catch (err) {
      console.error(err);
      showModal("Error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <LoadingOverlay />
      </main>
    );
  }

  return (
    <main className="page-shell">
      {(saving || rateLoading) && <LoadingOverlay />}

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/trips/${tripId}`)}
          className="cursor-pointer border-0 bg-transparent text-[#2D3135]"
        >
          <ChevronLeft size={24} strokeWidth={1} />
        </button>

        <h2 className="min-w-0 flex-1 truncate text-lg font-normal text-[#2D3135]">
          Add Expense
        </h2>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">Type</label>
        <ExpenseTypeGrid
          types={expenseTypes}
          selectedType={selectedType}
          onSelect={setSelectedType}
        />
      </div>

      <div className="mb-4">
        <input
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="note.."
          className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">Paid by</label>
        <select
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
          className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
        >
          <option value="">Select payer</option>
          {members.map((m) => (
            <option key={m.memberId} value={m.memberId}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-[#71767A]">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoComplete="off"
            className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[#71767A]">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
          >
            {currencyList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {currency !== "THB" && (
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
            />
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-[#71767A]">Service</label>
          <input
            type="number"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="only non-equal splits"
            autoComplete="off"
            className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none placeholder:text-xs"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[#71767A]">VAT</label>
          <input
            type="number"
            value={vat}
            onChange={(e) => setVat(e.target.value)}
            placeholder="only non-equal splits"
            autoComplete="off"
            className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none placeholder:text-xs"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">
          Split with
        </label>
        <SplitMemberGrid
          members={members}
          selectedMembers={selectedMembers}
          onToggle={toggleMember}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">Split</label>
        <select
          value={splitType}
          onChange={(e) => setSplitType(e.target.value as SplitType)}
          className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
        >
          <option value="equal">Equal</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {splitType === "custom" && (
        <div className="mb-4">
          <CustomSplitBox
            members={members}
            selectedMembers={selectedMembers}
            service={Number(service || 0)}
            vat={Number(vat || 0)}
            customShares={customShares}
            onChange={updateCustomShare}
          />
        </div>
      )}

      <button
        type="button"
        disabled={saving || rateLoading}
        onClick={saveExpense}
        className="w-full rounded-[14px] border-0 bg-[#ffe4ef] p-4 text-base text-[#2D3135] disabled:opacity-50"
      >
        Add Expense
      </button>

      <Modal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        onConfirm={() => {
          setModalOpen(false);

          if (success) {
            router.push(`/trips/${tripId}`);
          }
        }}
      />
    </main>
  );
}