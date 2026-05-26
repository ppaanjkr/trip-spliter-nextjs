import { type LucideIcon } from "lucide-react";

type ExpenseTypeItem = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

type Props = {
  types: ExpenseTypeItem[];
  selectedType: string;
  onSelect: (value: string) => void;
};

export default function ExpenseTypeGrid({
  types,
  selectedType,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {types.map((t) => {
        const selected = selectedType === t.value;
        const Icon = t.Icon;

        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onSelect(t.value)}
            className={`rounded-xl border p-3 text-center text-sm transition active:scale-[0.98] ${
              selected
                ? "border-[#E8E6E1] bg-[#ffe4ef]"
                : "border-[#E8E6E1] bg-white"
            }`}
          >
            <div className="mb-1 flex justify-center">
              <Icon size={24} strokeWidth={1} />
            </div>
            <div>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}