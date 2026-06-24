import { supabase } from "./supabaseClient";
import type {
  Account,
  ContactSummary,
  TransactionWithDirection,
  Wallet,
} from "../types";

/**
 * All read-only data access lives here as thin wrappers around Supabase
 * client calls (governed by RLS). All money-moving operations call Edge
 * Functions instead - see transferEcoPoints() below - never direct table
 * writes to `wallets`.
 */

export async function getMyAccount(): Promise<Account | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("getMyAccount failed:", error.message);
    return null;
  }
  return data as Account;
}

export async function getMyWallet(): Promise<Wallet | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("owner_account_id", user.id)
    .single();

  if (error) {
    console.error("getMyWallet failed:", error.message);
    return null;
  }
  return data as Wallet;
}

export async function getContacts(searchTerm = ""): Promise<ContactSummary[]> {
  let query = supabase
    .from("accounts")
    .select("id, full_name, eco_id, account_type, category, avatar_seed")
    .eq("status", "approved")
    .order("full_name");

  if (searchTerm.trim()) {
    query = query.or(`full_name.ilike.%${searchTerm}%,eco_id.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("getContacts failed:", error.message);
    return [];
  }
  return data as ContactSummary[];
}

export async function getMyTransactions(limit = 50): Promise<TransactionWithDirection[]> {
  const wallet = await getMyWallet();
  if (!wallet) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .or(`from_wallet_id.eq.${wallet.id},to_wallet_id.eq.${wallet.id}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getMyTransactions failed:", error.message);
    return [];
  }

  // Resolve counterparty display info. For a small recent list this is fine
  // as a follow-up batch query; if history grows large, replace with a
  // Postgres view that joins this server-side.
  const counterpartyWalletIds = Array.from(
    new Set(
      data.map((tx) => (tx.from_wallet_id === wallet.id ? tx.to_wallet_id : tx.from_wallet_id)),
    ),
  );

  const { data: counterpartyAccounts } = await supabase
    .from("accounts")
    .select("id, full_name, eco_id, account_type")
    .in(
      "id",
      // accounts.id == wallets.owner_account_id, but we only have wallet ids here,
      // so resolve via wallets first.
      (
        await supabase
          .from("wallets")
          .select("owner_account_id")
          .in("id", counterpartyWalletIds)
      ).data?.map((w) => w.owner_account_id).filter(Boolean) ?? [],
    );

  const { data: counterpartyWallets } = await supabase
    .from("wallets")
    .select("id, owner_account_id")
    .in("id", counterpartyWalletIds);

  const walletToAccount = new Map(
    (counterpartyWallets ?? []).map((w) => [w.id, w.owner_account_id]),
  );
  const accountById = new Map((counterpartyAccounts ?? []).map((a) => [a.id, a]));

  return data.map((tx) => {
    const direction: "in" | "out" = tx.to_wallet_id === wallet.id ? "in" : "out";
    const counterpartyWalletId = direction === "in" ? tx.from_wallet_id : tx.to_wallet_id;
    const counterpartyAccountId = walletToAccount.get(counterpartyWalletId);
    const counterparty = counterpartyAccountId ? accountById.get(counterpartyAccountId) : null;

    return {
      ...tx,
      direction,
      counterparty_name: counterparty?.full_name ?? "Institution",
      counterparty_eco_id: counterparty?.eco_id ?? "",
    };
  });
}

export interface TransferParams {
  toEcoId: string;
  amount: number;
  note?: string;
  referenceId?: string;
}

export async function transferEcoPoints(
  params: TransferParams,
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Not signed in" };
  }

  const { data, error } = await supabase.functions.invoke("transfer", {
    body: {
      to_eco_id: params.toEcoId,
      amount: params.amount,
      note: params.note,
      reference_id: params.referenceId,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  if (data?.error) {
    return { success: false, error: data.error };
  }

  return { success: true, transactionId: data.transaction_id };
}

export async function getMyNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("account_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getMyNotifications failed:", error.message);
    return [];
  }
  return data;
}

export async function markNotificationRead(id: string) {
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}
