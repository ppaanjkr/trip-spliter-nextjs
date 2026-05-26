"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { currencies } from "@/data/currencies";
import { Member } from "@/types/member";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import Modal from "@/components/common/Modal";

export default function Page() {
  const router = useRouter();

  const [tripName, setTripName] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("Notice");
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchMembers() {
      try {
        const res = await fetch("/api/members");
        const data = await res.json();

        if (!ignore) {
          setMembers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setMembers([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchMembers();

    return () => {
      ignore = true;
    };
  }, []);

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  async function createTrip() {
    const name = tripName.trim();

    if (!name) {
      showModal("Notice", "Please enter trip name");
      return;
    }

    if (selectedMembers.length === 0) {
      showModal("Notice", "Please select members");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripName: name,
          currency,
          memberIds: selectedMembers,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showModal("Error", data.message || "Error occurred");
        return;
      }

      showModal("Success", "Trip created successfully", data.tripId);
    } catch (err) {
      console.error(err);
      showModal("Error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function showModal(title: string, message: string, tripId?: string) {
    setModalTitle(title);
    setModalMessage(message);
    setCreatedTripId(tripId || null);
    setModalOpen(true);
  }

  return (
    <main className="page-shell">
      {(loading || saving) && <LoadingOverlay />}
      <Modal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        onConfirm={() => {
          setModalOpen(false);

          if (createdTripId) {
            router.push(`/trips/${createdTripId}`);
          }
        }}
      />
      <div className="mb-3 flex items-center gap-2 ">
        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer border-0 bg-transparent text-[#2D3135]"
        >
          <ChevronLeft size={24} strokeWidth={1} />
        </button>

        <h2 className="min-w-0 flex-1 truncate text-lg font-normal text-[#2D3135]">
          Create Trip
        </h2>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">Trip Name</label>
        <input
          value={tripName}
          autoComplete="off"
          onChange={(e) => setTripName(e.target.value)}
          className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-xl border border-[#E8E6E1] bg-white p-3 text-sm outline-none"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-[#71767A]">Members</label>

        {members && members.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            {members.map((m) => {
              const selected = selectedMembers.includes(m.memberId);

              return (
                <button
                  key={m.memberId}
                  type="button"
                  onClick={() => toggleMember(m.memberId)}
                  className={`cursor-pointer rounded-xl border p-3 text-center text-sm transition active:scale-[0.98] ${
                    selected
                      ? "border-[#ff6fa5]/50 bg-[#ffe4ef]/50"
                      : "border-[#E8E6E1] bg-white"
                  }`}
                >
                  <div>{m.avatar}</div>
                  <div>{m.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={createTrip}
        className="w-full rounded-2xl border-0 bg-[#ffe4ef] p-4 text-base text-[#2D3135] disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create Trip"}
      </button>
    </main>
  );
}
