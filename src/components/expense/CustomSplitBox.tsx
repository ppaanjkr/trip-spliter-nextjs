import { Member } from "@/types/member";

type Props = {
  members: Member[];
  selectedMembers: string[];
  service: number;
  vat: number;
  customShares: Record<string, string>;
  onChange: (memberId: string, value: string) => void;
};

export default function CustomSplitBox({
  members,
  selectedMembers,
  service,
  vat,
  customShares,
  onChange,
}: Props) {
  if (selectedMembers.length === 0) {
    return <div className="text-sm text-[#71767A]">Select members first</div>;
  }

  const extraPerPerson =
    Math.round(((service + vat) / selectedMembers.length) * 100) / 100;

  return (
    <div className="space-y-4">
      {selectedMembers.map((id) => {
        const m = members.find((x) => x.memberId === id);

        return (
          <div key={id}>
            <label className="mb-1.5 block text-sm text-[#71767A]">
              {m?.name || id}
            </label>

            <div className="flex overflow-hidden rounded-xl border border-[#E8E6E1] bg-white">
              <input
                type="number"
                value={customShares[id] || ""}
                onChange={(e) => onChange(id, e.target.value)}
                placeholder="0"
                autoComplete="off"
                className="min-w-0 flex-1 border-0 bg-transparent p-3 text-sm outline-none"
              />

              <div className="border-l border-[#E8E6E1] bg-[#FAF9F6] px-3 py-3 text-sm text-[#71767A]">
                +{extraPerPerson}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}