import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyNotifications, markNotificationRead } from "../lib/api";
import type { AppNotification } from "../types";

export function NotificationsView() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyNotifications().then((list) => {
      setNotifications(list as AppNotification[]);
      setLoading(false);
    });
  }, []);

  async function handleOpen(n: AppNotification) {
    if (!n.read) {
      await markNotificationRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-8 bg-surface scrollbar-hide flex flex-col">
      <div className="px-4 pt-6 pb-4 flex items-center gap-2 bg-surface sticky top-0 z-20">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="Back"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-medium text-gray-900">Notifications</h1>
      </div>

      <div className="px-4 pt-2 space-y-1">
        {!loading && notifications.length === 0 && (
          <p className="text-sm text-gray-500 px-2 py-8 text-center">You're all caught up.</p>
        )}
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => handleOpen(n)}
            className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl transition ${
              n.read ? "bg-surface" : "bg-primary-container/40"
            } hover:bg-surface-container`}
          >
            <span className="material-symbols-rounded text-primary mt-0.5">
              {n.read ? "notifications" : "notifications_active"}
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-medium text-gray-900">{n.title}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">{n.body}</p>
              <p className="text-[12px] text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
