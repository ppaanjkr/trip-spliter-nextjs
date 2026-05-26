import { Expense } from "@/types/expense";
import { roundMoney } from "./money";

export type SettlementTransaction = {
  from: string;
  to: string;
  amount: number;
};

export function calculatePairwiseDebts(expenses: Expense[]) {
  const debtMap: Record<string, Record<string, number>> = {};

  expenses.forEach((expense) => {
    const payerId = expense.payerId;

    expense.splits.forEach((split) => {
      const memberId = split.memberId;

      if (memberId === payerId) return;

      if (!debtMap[memberId]) debtMap[memberId] = {};
      if (!debtMap[memberId][payerId]) debtMap[memberId][payerId] = 0;

      debtMap[memberId][payerId] += Number(split.amountTHB || 0);
    });
  });

  const result: SettlementTransaction[] = [];

  Object.keys(debtMap).forEach((from) => {
    Object.keys(debtMap[from]).forEach((to) => {
      const amount = roundMoney(debtMap[from][to]);

      if (amount > 0) {
        result.push({
          from,
          to,
          amount,
        });
      }
    });
  });

  return result.sort((a, b) => {
    if (a.from !== b.from) return a.from.localeCompare(b.from);
    return a.to.localeCompare(b.to);
  });
}

export function calculateBalances(expenses: Expense[]) {
  const balances: Record<string, number> = {};

  expenses.forEach((expense) => {
    if (!balances[expense.payerId]) balances[expense.payerId] = 0;
    balances[expense.payerId] += Number(expense.amountTHB || 0);

    expense.splits.forEach((split) => {
      if (!balances[split.memberId]) balances[split.memberId] = 0;
      balances[split.memberId] -= Number(split.amountTHB || 0);
    });
  });

  Object.keys(balances).forEach((id) => {
    balances[id] = roundMoney(balances[id]);
  });

  return balances;
}