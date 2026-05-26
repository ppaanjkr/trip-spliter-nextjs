import {
  Bed,
  Car,
  CircleEllipsis,
  Hamburger,
  ShoppingCart,
  TicketSlash,
  type LucideIcon,
} from "lucide-react";

import { ExpenseType } from "@/types/expense";

export const expenseTypes: {
  value: ExpenseType;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "food", label: "Food", Icon: Hamburger },
  { value: "transport", label: "Transport", Icon: Car },
  { value: "ticket", label: "Ticket", Icon: TicketSlash },
  { value: "hotel", label: "Hotel", Icon: Bed },
  { value: "shopping", label: "Shopping", Icon: ShoppingCart },
  { value: "other", label: "Other", Icon: CircleEllipsis },
];