export type AccountType = "student" | "business";
export type AccountStatus = "pending" | "approved" | "suspended";

export interface Account {
  id: string;
  institution_id: string;
  account_type: AccountType;
  full_name: string;
  eco_id: string;
  email: string;
  phone: string | null;
  category: string | null;
  avatar_seed: string | null;
  status: AccountStatus;
  approved_at: string | null;
  created_at: string;
}

export interface Institution {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  mint_amount_per_student: number;
}

export interface Wallet {
  id: string;
  owner_type: "platform" | "institution" | "account";
  owner_account_id: string | null;
  balance: number;
  version: number;
}

export type TransactionType =
  | "mint"
  | "institution_to_student"
  | "student_to_institution"
  | "student_to_student"
  | "student_to_business"
  | "business_to_student";

export interface Transaction {
  id: string;
  type: TransactionType;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  note: string | null;
  status: "pending" | "completed" | "failed" | "reversed";
  created_at: string;
}

export interface TransactionWithDirection extends Transaction {
  direction: "in" | "out";
  counterparty_name: string;
  counterparty_eco_id: string;
}

export interface AppNotification {
  id: string;
  account_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface ContactSummary {
  id: string;
  full_name: string;
  eco_id: string;
  account_type: AccountType;
  category: string | null;
  avatar_seed: string | null;
}
