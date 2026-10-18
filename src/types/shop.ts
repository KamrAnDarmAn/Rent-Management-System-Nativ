export type RentCalendar = "gregorian" | "shamsi";
export type RentAllocation = { period: string; amount: number };
export type RentReceipt = {
  id: string;
  date: string;
  amount: number;
  method: "Cash" | "Other";
  note?: string;
  reversedAt?: string;
  reversalReason?: string;
};
export type RentTransaction = {
  id: string;
  date: string;
  period: string;
  amount: number;
  kind: "cash" | "credit";
  calendar: RentCalendar;
  note?: string;
  receiptId?: string;
  sourceId?: string;
  source?: "goods";
};

export type ShopStatus =
  "Paid" | "Partial" | "Unpaid" | "Overdue" | "Settled by Credit";

export type Shop = {
  id: number;
  number: string;
  name: string;
  keeper: string;
  phone: string;
  address: string;
  startDate: string;
  rentCalendar?: RentCalendar;
  rentPayments?: Record<string, number>;
  openingRentPeriod?: string;
  rentTransactions?: RentTransaction[];
  rentReceipts?: RentReceipt[];
  rentLedgerStartDate?: string;
  notes: string;
  rent: number;
  paid: number;
  credit: number;
  status: ShopStatus;
  occupied: boolean;
  rentalType?: "monthly" | "prepaid";
  prepaidRent?: {
    amount: number;
    startDate: string;
    monthlyRent: number;
    calendar?: RentCalendar;
    tenancyStartDate?: string;
  };
  prepaidPayments?: Record<string, number>;
  image: number;
  archivedAt?: string;
  deletedAt?: string;
  tenancyEndDate?: string;
  initialRent?: number;
  rentRates?: { effective: string; amount: number }[];
};
