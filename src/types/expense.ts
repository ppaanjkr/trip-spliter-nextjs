import { Member } from "./member";

export type ExpenseType =
  | "food"
  | "transport"
  | "shopping"
  | "hotel"
  | "ticket"
  | "other";

export type SplitMode = "equal" | "smart" | "custom";

export type ExpenseSplit = {
  memberId: string;
  amountTHB: number;
  member?: Member;
};

export type Expense = {
  expenseId: string;
  tripId: string;
  type: ExpenseType;
  remark: string;
  payerId: string;
  payer?: Member;
  amount: number;
  serviceCharge: number;
  tax: number;
  currency: string;
  rate: number;
  amountTHB: number;
  splitMode: SplitMode;
  createdAt: string;
  splits: ExpenseSplit[];
};

export type AddExpensePayload = {
  tripId: string;
  type: ExpenseType;
  remark: string;
  payerId: string;
  amount: number;
  serviceCharge: number;
  tax: number;
  currency: string;
  rate: number;
  splitMode: SplitMode;
  selectedMembers: string[];
  foodShares: Record<string, number>;
  customShares: Record<string, number>;
};