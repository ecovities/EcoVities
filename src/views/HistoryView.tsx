import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions } from "../lib/api";
import { InitialAvatar } from "../components/Avatar";
import type { TransactionWithDirection } from "../types";

function groupByDate(transactions: TransactionWithDirection[]) {
  const groups = new Map<string, TransactionWithDirection[]>();
  for (const tx of transactions) {
    const label = new Date(tx.created_at).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(tx);
  }
  return Array.from(groups.entries());
}

export function HistoryView() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionWithDirection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTransactions(100).then((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
  }, []);

  const grouped = groupByDate(transactions);

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-surface scrollbar-hide flex flex-col">
      <div className="px-4 pt-6 pb-4 flex items-center gap-2 bg-surface sticky top-0 z-20 shadow-sm shadow-white/50">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="Back"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-medium text-gray-900">Transaction History</h1>
      </div>

      <div className="px-4 pt-2">
        {!loading && transactions.length === 0 && (
          <p className="text-sm text-gray-500 px-2 py-8 text-center">No transactions yet.</p>
        )}

        {grouped.map(([date, txs]) => (
          <div key={date} className="mb-6">
            <h3 className="text-xs font-semibold tracking-wider text-gray-500 mb-2 px-2 uppercase">
              {date}
            </h3>
            <div className="bg-surface-container rounded-3xl p-2 space-y-1">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-highest transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <InitialAvatar name={tx.counterparty_name} size={48} />
                    <div>
                      <p className="text-[15px] font-medium text-gray-900">
                        {tx.counterparty_name}
                      </p>
                      <p className="text-[13px] text-gray-500">
                        {new Date(tx.created_at).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {tx.note ? ` · ${tx.note}` : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-medium text-[15px] ${tx.direction === "in" ? "text-primary" : "text-gray-900"}`}
                  >
                    {tx.direction === "in" ? "+" : "-"}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
