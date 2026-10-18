export type Expense = {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date?: string;
  shopId?: number;
  type?: "Property Expense" | "Personal Expense";
  method?: "Cash" | "Bank Transfer" | "Credit" | "Other" | "Rent Offset";
  notes?: string;
  settlementFor?: string;
};
