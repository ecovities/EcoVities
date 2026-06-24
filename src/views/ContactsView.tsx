import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getContacts } from "../lib/api";
import { InitialAvatar } from "../components/Avatar";
import type { ContactSummary } from "../types";

const BUSINESS_ICONS: Record<string, string> = {
  cafeteria: "storefront",
  stationery: "edit",
  club: "groups",
  library: "menu_book",
  transit: "directions_bus",
};

export function ContactsView() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ContactSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      const list = await getContacts(search);
      if (!cancelled) {
        setContacts(list.filter((c) => c.id !== account?.id));
        setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, account?.id]);

  return (
    <div className="flex-col flex-1 h-full bg-surface relative flex">
      <div className="px-4 pt-6 pb-2 bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition shrink-0"
            aria-label="Back"
          >
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div className="flex-1 flex items-center bg-surface-container rounded-full px-4 py-3 border border-transparent focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
            <span className="material-symbols-rounded text-gray-500 mr-2">search</span>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Pay anyone on EcoVities"
              className="bg-transparent outline-none w-full text-[15px] text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-20 scrollbar-hide">
        <h3 className="text-xs font-semibold tracking-wider text-gray-500 mb-2 px-4 uppercase">
          {search ? "Results" : "All contacts on EcoVities"}
        </h3>

        {!loading && contacts.length === 0 && (
          <p className="text-sm text-gray-500 px-4 py-6">No matches found.</p>
        )}

        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/pay/${c.eco_id}`)}
            className="w-full flex items-center gap-4 p-3 mx-2 rounded-2xl hover:bg-surface-container transition cursor-pointer text-left"
          >
            <InitialAvatar
              name={c.full_name}
              isBusiness={c.account_type === "business"}
              icon={c.category ? BUSINESS_ICONS[c.category] ?? "storefront" : undefined}
            />
            <div className="flex-1">
              <p className="text-[15px] font-medium text-gray-900">{c.full_name}</p>
              <p className="text-[13px] text-gray-500">
                {c.account_type === "business" ? "Business Account" : c.eco_id}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
