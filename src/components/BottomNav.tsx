import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", icon: "home", label: "Home", end: true },
  { to: "/history", icon: "receipt_long", label: "History" },
  { to: "/scan", icon: "qr_code_scanner", label: "Scan" },
  { to: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-gray-200 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-30">
      <div className="flex justify-around">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-item relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="nav-indicator" />
                <span
                  className="material-symbols-rounded relative z-10"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[11px] relative z-10"
                  style={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
