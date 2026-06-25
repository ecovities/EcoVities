import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getContacts, getMyTransactions } from "../lib/api";
import { useWallet } from "../hooks/useWallet";
import { useNotifications } from "../hooks/useNotifications";
import { Avatar, InitialAvatar } from "../components/Avatar";
import type { ContactSummary, TransactionWithDirection } from "../types";

const BUSINESS_ICONS: Record<string, string> = {
  cafeteria: "storefront",
  stationery: "edit",
  club: "groups",
  library: "menu_book",
  transit: "directions_bus",
};

export function HomeView() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const { balance, loading: walletLoading } = useWallet();
  const { unreadCount } = useNotifications();
  const [contacts, setContacts] = useState<ContactSummary[]>([]);
  const [recent, setRecent] = useState<TransactionWithDirection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [contactList, txs] = await Promise.all([
        getContacts(),
        getMyTransactions(3),
      ]);
      if (cancelled) return;
      setContacts(contactList.filter((c) => c.id !== account?.id).slice(0, 6));
      setRecent(txs);
      setDataLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [account?.id]);

  return (
    <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-rounded text-xl icon-filled">eco</span>
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">EcoVities</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/notifications")}
            className="relative text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
            aria-label="Notifications"
          >
            <span className="material-symbols-rounded">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface" />
            )}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm hover:opacity-80 transition"
            aria-label="Profile"
          >
            <Avatar seed={account?.full_name ?? "User"} size={36} />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="px-6 py-6 text-center">
        <p className="text-sm font-medium text-gray-600 mb-2">Available EcoPoints</p>
        <h1 className="text-6xl font-semibold text-gray-900 tracking-tighter flex justify-center items-center gap-2">
          <span className="text-3xl text-gray-400 font-medium mt-2">EP</span>
          {walletLoading ? (
            <span className="text-gray-300 animate-pulse">—</span>
          ) : (
            balance?.toLocaleString() ?? "0"
          )}
        </h1>
        {account?.account_type === "business" && (
          <span className="inline-block mt-2 text-[12px] font-medium bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
            Business Account
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-6 py-4 grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate("/scan")}
          className="bg-primary text-white py-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition active:scale-95 shadow-md"
        >
          <span className="material-symbols-rounded">qr_code_scanner</span>
          <span className="text-[13px] font-medium tracking-wide">Scan QR</span>
        </button>
        <button
          onClick={() => navigate("/contacts")}
          className="bg-surface-container-high text-gray-900 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest transition active:scale-95 shadow-sm"
        >
          <span className="material-symbols-rounded">arrow_upward</span>
          <span className="text-[13px] font-medium tracking-wide">Send</span>
        </button>
        <button
          onClick={() => navigate("/receive")}
          className="bg-surface-container-high text-gray-900 py-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest transition active:scale-95 shadow-sm"
        >
          <span className="material-symbols-rounded">arrow_downward</span>
          <span className="text-[13px] font-medium tracking-wide">Receive</span>
        </button>
      </div>

      {/* Contacts strip */}
      <div className="mt-4 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-medium text-gray-900">People &amp; businesses</h2>
          <button
            onClick={() => navigate("/contacts")}
            className="text-primary text-sm font-medium hover:opacity-80 transition"
          >
            See all
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {!dataLoading && contacts.length === 0 && (
            <p className="text-sm text-gray-500">No contacts yet.</p>
          )}
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/pay/${c.eco_id}`)}
              className="flex flex-col items-center min-w-[72px] cursor-pointer group"
            >
              <div className="group-hover:scale-105 transition">
                <InitialAvatar
                  name={c.full_name}
                  isBusiness={c.account_type === "business"}
                  icon={c.category ? (BUSINESS_ICONS[c.category] ?? "storefront") : undefined}
                />
              </div>
              <span className="text-[13px] text-gray-800 font-medium truncate w-full text-center mt-2">
                {c.full_name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-2 px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-medium text-gray-900">Recent activity</h2>
          <button
            onClick={() => navigate("/history")}
            className="text-primary bg-primary-container px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition"
          >
            View all
          </button>
        </div>

        <div className="bg-surface-container rounded-3xl p-2 space-y-1">
          {!dataLoading && recent.length === 0 && (
            <p className="text-sm text-gray-500 p-3">No activity yet.</p>
          )}
          {recent.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-highest transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <InitialAvatar name={tx.counterparty_name} size={48} />
                <div>
                  <p className="text-[15px] font-medium text-gray-900">{tx.counterparty_name}</p>
                  <p className="text-[13px] text-gray-500">
                    {new Date(tx.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
              <div
                className={`font-medium text-[15px] ${
                  tx.direction === "in" ? "text-primary" : "text-gray-900"
                }`}
              >
                {tx.direction === "in" ? "+" : "-"}{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
