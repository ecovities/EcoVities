import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { getMyWallet } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function useWallet() {
  const { account } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    const wallet = await getMyWallet();
    if (wallet) { setBalance(wallet.balance); setWalletId(wallet.id); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!account?.id) return;
    loadWallet();
  }, [account?.id, loadWallet]);

  useEffect(() => {
    if (!walletId) return;
    const channel = supabase
      .channel(`wallet-${walletId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "wallets", filter: `id=eq.${walletId}` },
        (payload) => { if (typeof payload.new?.balance === "number") setBalance(payload.new.balance); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [walletId]);

  return { balance, loading, refresh: loadWallet };
}
