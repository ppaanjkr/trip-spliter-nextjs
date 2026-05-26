import { Expense } from "@/types/expense";
import { formatMoney } from "@/lib/money";
import { CircleDollarSign } from "lucide-react";

type SummaryListProps = {
  expenses: Expense[];
  totalTHB: number;
};

export default function SummaryList({ expenses, totalTHB }: SummaryListProps) {
  if (!expenses.length) {
    return <div className="w-full h-50 items-center justify-center flex"><CircleDollarSign size={24} strokeWidth={1} /></div>
  }

  const summaryCategory: Record<string, { totalTHB: number; count: number }> =
    {};

  expenses.forEach((e) => {
    const key = e.type || "other";

    if (!summaryCategory[key]) {
      summaryCategory[key] = {
        totalTHB: 0,
        count: 0,
      };
    }

    summaryCategory[key].totalTHB += Number(e.amountTHB || 0);
    summaryCategory[key].count += 1;
  });

  return (
    <div>
      <div className="old-card text-center">
        <div className="text-sm text-[#71767A]">Total Trip Cost</div>
        <div className="mt-1 text-2xl font-semibold text-[#2D3135]">
          {formatMoney(totalTHB)} THB
        </div>
        <div className="mt-1 text-xs text-[#71767A]">
          {expenses.length} expenses
        </div>
      </div>

      <div className="mb-2 mt-5 text-sm font-semibold text-[#2D3135]">
        By Category
      </div>

      {Object.entries(summaryCategory).map(([type, val]) => {
        const percent = totalTHB > 0 ? (val.totalTHB / totalTHB) * 100 : 0;

        return (
          <div key={type} className="old-card">
            <div className="mb-2 flex justify-between text-sm">
              <div>{type}</div>
              <div>{formatMoney(val.totalTHB)} THB</div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#E8E6E1]">
              <div
                className="h-full rounded-full bg-[#ff6fa5]"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="mt-2 text-xs text-[#71767A]">
              {val.count} expense • {percent.toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}