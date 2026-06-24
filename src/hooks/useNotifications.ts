import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getMyNotifications } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { AppNotification } from "../types";

/**
 * Loads notifications and keeps the unread count live via Supabase Realtime.
 * The Home view uses `unreadCount` to show the red dot on the bell icon.
 */
export function useNotifications() {
  const { account } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account?.id) return;

    getMyNotifications().then((list) => {
      setNotifications(list as AppNotification[]);
      setLoading(false);
    });

    const channel = supabase
      .channel(`notifications-${account.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `account_id=eq.${account.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as AppNotification, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [account?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, setNotifications };
}
