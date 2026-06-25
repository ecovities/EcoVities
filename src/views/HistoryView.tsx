import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions } from "../lib/api";
import { InitialAvatar } from "../components/Avatar";
import type { TransactionWithDirection } from "../types";

type SortKey = "newest" | "oldest" | "highest" | "lowest";
type FilterKey = "all" | "in" | "out";

function smartDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today) return "Today";
  if (d.toDateString() === yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function groupByDate(txs: TransactionWithDirection[]) {
  const map = new Map<string, TransactionWithDirection[]>();
  for (const tx of txs) {
    const key = smartDate(tx.created_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries());
}

export function HistoryView() {
  const navigate = useNavigate();
  const [all, setAll] = useState<TransactionWithDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    getMyTransactions(200).then((txs) => { setAll(txs); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let r = [...all];
    if (filter === "in") r = r.filter((t) => t.direction === "in");
    if (filter === "out") r = r.filter((t) => t.direction === "out");
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) =>
          t.counterparty_name.toLowerCase().includes(q) ||
          (t.note ?? "").toLowerCase().includes(q),
      );
    }
    if (sort === "newest") r.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === "oldest") r.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    if (sort === "highest") r.sort((a, b) => b.amount - a.amount);
    if (sort === "lowest") r.sort((a, b) => a.amount - b.amount);
    return r;
  }, [all, filter, search, sort]);

  const useGroups = sort === "newest" || sort === "oldest";
  const groups = useMemo(() => (useGroups ? groupByDate(filtered) : null), [filtered, useGroups]);

  const totalIn = useMemo(() => all.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0), [all]);
  const totalOut = useMemo(() => all.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0), [all]);

  const SORT_LABELS: Record<SortKey, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    highest: "Highest amount",
    lowest: "Lowest amount",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f7f5]">

      {/* ── Top bar ── */}
      <div className="bg-surface px-4 pt-5 pb-3">
        <div className="flex items-center gap-1 mb-5">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition active:scale-95 text-gray-700"
          >
            <span className="material-symbols-rounded text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-[20px] font-semibold text-gray-900 tracking-tight ml-1 flex-1">Activity</h1>
          <button
            onClick={() => setSortOpen((v) => !v)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition active:scale-95 ${sortOpen ? "bg-primary-container text-primary" : "hover:bg-surface-container text-gray-600"}`}
          >
            <span className="material-symbols-rounded text-[22px]">sort</span>
          </button>
        </div>

        {/* Search pill */}
        <div className="flex items-center gap-3 bg-surface-container rounded-full px-4 py-2.5 mb-4">
          <span className="material-symbols-rounded text-gray-400 text-[20px] shrink-0">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search transactions…"
            className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder-gray-400 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="shrink-0 text-gray-400 hover:text-gray-600 transition">
              <span className="material-symbols-rounded text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Sort drawer */}
        {sortOpen && (
          <div className="mb-3 bg-surface-container rounded-2xl overflow-hidden">
            {(["newest", "oldest", "highest", "lowest"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => { setSort(k); setSortOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-[14px] transition hover:bg-surface-container-high ${sort === k ? "text-primary font-medium" : "text-gray-700"}`}
              >
                {SORT_LABELS[k]}
                {sort === k && <span className="material-symbols-rounded text-[18px] text-primary">check</span>}
              </button>
            ))}
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-2">
          {(["all", "in", "out"] as FilterKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition active:scale-95 ${
                filter === k
                  ? "bg-primary text-white"
                  : "bg-surface-container text-gray-600 hover:bg-surface-container-high"
              }`}
            >
              {k === "all" ? "All" : k === "in" ? "Received" : "Sent"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary cards ── */}
      {!loading && all.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-1">
          <div className="bg-[#e8f5e9] rounded-2xl px-4 py-3">
            <p className="text-[11px] font-medium text-[#2e7d32] uppercase tracking-wide mb-1">Total received</p>
            <p className="text-[20px] font-bold text-[#1b5e20]">+{totalIn.toLocaleString()} <span className="text-[13px] font-medium">EP</span></p>
          </div>
          <div className="bg-[#fce4ec] rounded-2xl px-4 py-3">
            <p className="text-[11px] font-medium text-[#c62828] uppercase tracking-wide mb-1">Total sent</p>
            <p className="text-[20px] font-bold text-[#b71c1c]">−{totalOut.toLocaleString()} <span className="text-[13px] font-medium">EP</span></p>
          </div>
        </div>
      )}

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-3 pb-8">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-1 mt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 rounded-full w-32 mb-2" />
                  <div className="h-3 bg-gray-100 rounded-full w-20" />
                </div>
                <div className="h-4 bg-gray-200 rounded-full w-14" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-rounded text-3xl text-gray-400">receipt_long</span>
            </div>
            <p className="text-[15px] font-medium text-gray-700">No transactions found</p>
            <p className="text-[13px] text-gray-400 max-w-[200px]">
              {search || filter !== "all" ? "Try adjusting your filters" : "Your activity will appear here"}
            </p>
            {(search || filter !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilter("all"); }}
                className="mt-1 text-primary text-[13px] font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grouped by date */}
        {!loading && filtered.length > 0 && useGroups && groups && groups.map(([date, txs]) => (
          <div key={date} className="mb-2">
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-widest px-1 py-2">{date}</p>
            <div className="bg-surface rounded-2xl overflow-hidden">
              {txs.map((tx, i) => (
                <TxRow key={tx.id} tx={tx} last={i === txs.length - 1} />
              ))}
            </div>
          </div>
        ))}

        {/* Flat list (sorted by amount) */}
        {!loading && filtered.length > 0 && !useGroups && (
          <div className="bg-surface rounded-2xl overflow-hidden mt-2">
            {filtered.map((tx, i) => (
              <TxRow key={tx.id} tx={tx} last={i === filtered.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TxRow({ tx, last }: { tx: TransactionWithDirection; last: boolean }) {
  const isIn = tx.direction === "in";
  const time = new Date(tx.created_at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 active:bg-surface-container transition ${!last ? "border-b border-gray-100" : ""}`}>
      {/* Avatar */}
      <div className="shrink-0">
        <InitialAvatar name={tx.counterparty_name} size={44} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-gray-900 truncate leading-snug">
          {tx.counterparty_name}
        </p>
        <p className="text-[12px] text-gray-400 truncate mt-0.5">
          {time}{tx.note ? ` · ${tx.note}` : ""}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className={`text-[16px] font-semibold leading-snug ${isIn ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
          {isIn ? "+" : "−"}{tx.amount.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">EP</p>
      </div>
    </div>
  );
}
