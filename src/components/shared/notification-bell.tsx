"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck, CreditCard, Wrench, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/features/notifications/actions";
import { usePushNotification } from "@/hooks/use-push-notification";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
}

export function NotificationBell({ notifications: initialNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const { isSupported, isSubscribed, permission, subscribeToPush, loading: pushLoading } = usePushNotification();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BILLING":
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case "MAINTENANCE":
        return <Wrench className="h-4 w-4 text-amber-400" />;
      case "SYSTEM":
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const formatDate = (dateString: Date | string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-full"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 border-zinc-800 bg-zinc-950/95 text-white p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-3 px-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-wide text-zinc-200">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                {unreadCount} baru
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="h-7 text-xs text-zinc-400 hover:text-white px-2"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Tandai dibaca
            </Button>
          )}
        </div>

        {/* Prompt to Enable Push Notifications if not subscribed */}
        {isSupported && !isSubscribed && permission !== "denied" && (
          <div className="bg-gradient-to-r from-secondary/10 to-amber-500/10 p-3 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-white">Aktifkan Push Notif</p>
              <p className="text-[11px] text-zinc-400">
                Dapatkan notifikasi di layar HP saat tagihan terbit.
              </p>
            </div>
            <Button
              size="sm"
              onClick={subscribeToPush}
              disabled={pushLoading}
              className="h-7 text-xs bg-secondary text-zinc-950 hover:bg-secondary/90 font-bold shrink-0 ml-2"
            >
              {pushLoading ? "..." : "Aktifkan"}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900/60 scrollbar-thin scrollbar-thumb-zinc-800">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                className={`p-3 px-4 flex gap-3 items-start transition-colors cursor-pointer ${
                  item.isRead
                    ? "bg-transparent opacity-60 hover:opacity-100"
                    : "bg-zinc-900/40 hover:bg-zinc-900/70"
                }`}
              >
                <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Belum ada notifikasi saat ini.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
