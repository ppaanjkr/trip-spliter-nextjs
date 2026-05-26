import { Member } from "@/types/member";

type Props = {
  members: Member[];
  selectedMembers: string[];
  onToggle: (memberId: string) => void;
};

export default function SplitMemberGrid({
  members,
  selectedMembers,
  onToggle,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {members.map((m) => {
        const selected = selectedMembers.includes(m.memberId);

        return (
          <button
            key={m.memberId}
            type="button"
            onClick={() => onToggle(m.memberId)}
            className={`rounded-xl border p-3 text-center text-sm transition active:scale-[0.98] ${
              selected
                ? "border-[#E8E6E1] bg-[#ffe4ef]"
                : "border-[#E8E6E1] bg-white"
            }`}
          >
            <div>{m.avatar || m.name?.[0]}</div>
            <div>{m.name}</div>
          </button>
        );
      })}
    </div>
  );
}