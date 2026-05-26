import { Member } from "@/types/member";
import { cn } from "@/lib/utils";

type MemberChipProps = {
  member: Member;
  selected?: boolean;
  onClick?: () => void;
};

export default function MemberChip({
  member,
  selected = false,
  onClick,
}: MemberChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
        selected
          ? "border-pink-300 bg-pink-50 text-pink-600"
          : "border-pink-100 bg-white text-slate-600"
      )}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: member.color }}
      >
        {member.avatar}
      </span>
      <span>{member.name}</span>
    </button>
  );
}