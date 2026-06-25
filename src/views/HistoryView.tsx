import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions } from "../lib/api";
import { InitialAvatar } from "../components/Avatar";
import type { TransactionWithDirection } from "../types";

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type FilterOption = "all" | "in" | "out";

function groupByDate(transactions: TransactionWithDirection[]) {
  const groups = new Map<string, TransactionWithDirection[]>();
  for (const tx of transactions) {
    const d = new Date(tx.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else label = d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(tx);
  }
  return Array.from(groups.entries());
}

export function HistoryView() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionWithDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getMyTransactions(200).then((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
  }, []);

  const processed = useMemo(() => {
    let result = [...transactions];

    // Search by name or note
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.counterparty_name.toLowerCase().includes(q) ||
          tx.note?.toLowerCase().includes(q) ||
          tx.counterparty_eco_id.toLowerCase().includes(q),
      );
    }

    // Filter by direction
    if (filter === "in") result = result.filter((tx) => tx.direction === "in");
    if (filter === "out") result = result.filter((tx) => tx.direction === "out");

    // Sort
    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest") return b.amount - a.amount;
      if (sort === "lowest") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, search, filter, sort]);

  const totalIn = useMemo(() => processed.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0), [processed]);
  const totalOut = useMemo(() => processed.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0), [processed]);

  const grouped = useMemo(
    () => (sort === "newest" || sort === "oldest" ? groupByDate(processed) : null),
    [processed, sort],
  );

  const FILTER_OPTS: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All" },
    { value: "in", label: "Credits" },
    { value: "out", label: "Debits" },
  ];

  const SORT_OPTS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "highest", label: "Highest amount" },
    { value: "lowest", label: "Lowest amount" },
  ];

  const TxRow = ({ tx }: { tx: TransactionWithDirection }) => (
    <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <InitialAvatar name={tx.counterparty_name} size={44} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-gray-900 truncate">{tx.counterparty_name}</p>
          <p className="text-[12px] text-gray-400 truncate">
            {new Date(tx.created_at).toLocaleString(undefined, {
              month: "short", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
            {tx.note ? ` · ${tx.note}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end ml-3 shrink-0">
        <span
          className={`text-[16px] font-semibold ${
            tx.direction === "in" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {tx.direction === "in" ? "+" : "−"}{tx.amount} EP
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${
          tx.direction === "in"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-500"
        }`}>
          {tx.direction === "in" ? "Credit" : "Debit"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-surface scrollbar-hide flex flex-col">

      {/* Header */}
      <div className="px-4 pt-6 pb-3 bg-surface sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate("/")} className="p-2 text-gray-700 rounded-full hover:bg-gray-100 transition" aria-label="Back">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 flex-1">Transactions</h1>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`p-2 rounded-full transition ${showFilters ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
            aria-label="Filter and sort"
          >
            <span className="material-symbols-rounded">tune</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-surface-container rounded-2xl px-4 py-2.5 gap-2">
          <span className="material-symbols-rounded text-gray-400 text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by name or note…"
            className="bg-transparent w-full text-[14px] text-gray-900 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400">
              <span className="material-symbols-rounded text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-3 flex flex-col gap-3">
            {/* Direction filter chips */}
            <div className="flex gap-2">
              {FILTER_OPTS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFilter(o.value)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
                    filter === o.value
                      ? "bg-primary text-white"
                      : "bg-surface-container text-gray-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {/* Sort chips */}
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setSort(o.value)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition ${
                    sort === o.value
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container text-gray-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary strip */}
      {!loading && processed.length > 0 && (
        <div className="flex mx-4 mt-4 mb-2 rounded-2xl overflow-hidden border border-gray-100">
          <div className="flex-1 flex flex-col items-center py-3 bg-emerald-50">
            <span className="text-[11px] text-emerald-600 font-medium">Total Credits</span>
            <span className="text-[17px] font-bold text-emerald-600">+{totalIn} EP</span>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 flex flex-col items-center py-3 bg-red-50">
            <span className="text-[11px] text-red-500 font-medium">Total Debits</span>
            <span className="text-[17px] font-bold text-red-500">−{totalOut} EP</span>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 flex flex-col items-center py-3 bg-surface-container">
            <span className="text-[11px] text-gray-500 font-medium">Transactions</span>
            <span className="text-[17px] font-bold text-gray-700">{processed.length}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-rounded text-3xl text-gray-300 animate-pulse">receipt_long</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && processed.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="material-symbols-rounded text-5xl text-gray-200">search_off</span>
          <p className="text-gray-500 text-[15px]">
            {search || filter !== "all" ? "No transactions match your filters." : "No transactions yet."}
          </p>
          {(search || filter !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-2 text-primary text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Transaction list */}
      {!loading && processed.length > 0 && (
        <div className="flex-1 px-4 pb-8">
          {grouped ? (
            grouped.map(([date, txs]) => (
              <div key={date} className="mt-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 px-1">{date}</p>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  {txs.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                </div>
              </div>
            ))
          ) : (
            <div className="mt-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {processed.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
