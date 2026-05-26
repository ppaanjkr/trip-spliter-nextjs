import { CircleArrowRight, CircleDollarSign } from "lucide-react";
import { formatMoney } from "@/lib/money";

export type SettlementTransaction = {
  from: string;
  to: string;
  amount: number;
};

type SettleListProps = {
  transactions: SettlementTransaction[];
  getMemberName: (memberId: string) => string;
  getMemberPromptPay: (memberId: string) => string;
  onCopyPromptPay: (text: string) => void;
};

export default function SettleList({
  transactions,
  getMemberName,
  getMemberPromptPay,
  onCopyPromptPay,
}: SettleListProps) {
  if (!transactions.length) {
    return (
      <div className="w-full h-50 items-center justify-center flex"><CircleDollarSign size={24} strokeWidth={1} /></div>
    );
  }

  return (
    <div>
      <div className="mb-3 text-center text-xs text-[#71767A]">
        Tap card to copy PromptPay
      </div>

      {transactions.map((t) => {
        const from = getMemberName(t.from);
        const to = getMemberName(t.to);
        const pp = getMemberPromptPay(t.to);

        return (
          <button
            key={`${t.from}-${t.to}`}
            type="button"
            onClick={() => onCopyPromptPay(pp)}
            className="old-card w-full text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                {from}
                <CircleArrowRight size={16} strokeWidth={1} />
                {to}
              </span>

              <div className="text-sm text-[#71767A]">
                {formatMoney(t.amount)} THB
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}