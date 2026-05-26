import { Trash2 } from "lucide-react";
import { Expense } from "@/types/expense";
import { formatMoney } from "@/lib/money";

type ExpenseListProps = {
  expenses: Expense[];
  isActive: boolean;
  onDelete: (expenseId: string) => void;
  getMemberName: (memberId: string) => string;
};

export default function ExpenseList({
  expenses,
  isActive,
  onDelete,
  getMemberName,
}: ExpenseListProps) {
  if (!expenses.length) {
    return <div className="w-full h-50 items-center justify-center flex">No Expense</div>
  }

  return (
    <div>
      {expenses.map((e) => {
        const isTHB = e.currency === "THB";

        const extra =
          (Number(e.serviceCharge || 0) + Number(e.tax || 0)) *
          Number(e.rate || 1);

        const peopleCount = (e.splits || []).length;
        const extraPerPerson =
          extra > 0 && peopleCount > 0 ? extra / peopleCount : 0;

        return (
          <div key={e.expenseId} className="old-card">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-base text-[#2D3135]">
                  {e.type || ""}
                  {e.remark ? ` : ${e.remark}` : ""}
                </div>

                <div className="mt-1 text-sm text-[#71767A]">
                  {e.payer?.name || getMemberName(e.payerId)} paid{" "}
                  {isTHB
                    ? `${formatMoney(e.amountTHB)} THB`
                    : `${formatMoney(e.amount)} ${e.currency} (${formatMoney(
                        e.amountTHB
                      )} THB)`}
                </div>

                <div className="mt-2 flex flex-col gap-1">
                  {extraPerPerson > 0 && (
                    <span className="text-xs text-[#71767A]">
                      service/vat: {formatMoney(extraPerPerson)} THB/person
                    </span>
                  )}

                  <ExpenseSplit expense={e} />
                </div>
              </div>

              {isActive && (
                <button
                  type="button"
                  onClick={() => onDelete(e.expenseId)}
                  className="shrink-0 border-0 bg-transparent p-1"
                >
                  <Trash2 size={20} stroke="#71767A" strokeWidth={1} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExpenseSplit({ expense }: { expense: Expense }) {
  const splitsRaw = expense.splits || [];
  const amounts = splitsRaw.map((s) => Number(s.amountTHB || 0));

  const isEqual =
    amounts.length > 0 && amounts.every((a) => a === amounts[0]);

  if (!splitsRaw.length) return null;

  if (isEqual) {
    const names = splitsRaw
      .map((s) => s.member?.name || s.memberId)
      .join(", ");

    return (
      <div className="text-[11px] text-[#71767A]">
        FOR:{" "}
        <span className="text-sm text-[#2D3135]">
          {names} ({formatMoney(amounts[0])} THB)
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {splitsRaw.map((s) => (
        <div
          key={s.memberId}
          className="flex items-center justify-between gap-3 rounded-lg bg-[#FAF9F6] px-3 py-1 text-xs"
        >
          <span>{s.member?.name || s.memberId}</span>
          <span>{formatMoney(s.amountTHB)} THB</span>
        </div>
      ))}
    </div>
  );
}