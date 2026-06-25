import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/Avatar";

export function ProfileView() {
  const { account, signOut } = useAuth();

  const rows = [
    { icon: "badge", label: "EcoID", value: account?.eco_id },
    { icon: "mail", label: "Email", value: account?.email },
    {
      icon: account?.account_type === "business" ? "storefront" : "school",
      label: account?.account_type === "business" ? "Account type" : "Institution",
      value:
        account?.account_type === "business"
          ? `Business · ${account?.category ?? "General"}`
          : "Your institution",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-8 bg-surface scrollbar-hide flex flex-col">
      <div className="px-6 pt-10 pb-6 flex flex-col items-center bg-surface">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm mb-3">
          <Avatar seed={account?.full_name ?? "User"} size={80} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{account?.full_name}</h1>
        <p className="text-gray-500 text-[14px]">
          {account?.account_type === "business" ? "Business Account" : "Student"}
        </p>
      </div>

      <div className="px-6 mt-2 space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-4 bg-surface-container rounded-2xl p-4"
          >
            <span className="material-symbols-rounded text-gray-600">{row.icon}</span>
            <div>
              <p className="text-[12px] text-gray-500">{row.label}</p>
              <p className="text-[15px] font-medium text-gray-900">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-6">
        <button
          onClick={signOut}
          className="w-full bg-surface-container-high text-gray-900 py-3.5 rounded-full text-[15px] font-medium hover:bg-gray-300 transition active:scale-95"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
