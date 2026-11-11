"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck, CreditCard, Wrench, Info, ShieldAlert } from "lucide-react";
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
        return <CreditCard className="h-4 w-4 text-secondary" />;
      case "MAINTENANCE":
        return <Wrench className="h-4 w-4 text-amber-ochre" />;
      case "SYSTEM":
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
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
          className="relative text-[#4A453F] hover:text-[#1E1B18] hover:bg-[#F2EDE9] rounded-xl transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 border-[#2C2825]/15 bg-white text-[#1E1B18] p-0 shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#2C2825]/10 p-3 px-4 bg-[#FAF8F5]/80">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-wide text-[#1E1B18]">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
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
              className="h-7 text-xs text-[#5C564E] hover:text-[#1E1B18] hover:bg-[#F2EDE9] px-2 rounded-lg cursor-pointer"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5 text-secondary" /> Tandai dibaca
            </Button>
          )}
        </div>

        {/* Prompt to Enable Push Notifications if not subscribed */}
        {isSupported && !isSubscribed && permission !== "denied" && (
          <div className="bg-[#FAF2EA]/60 p-3 border-b border-[#2C2825]/10 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-[#1E1B18]">Aktifkan Push Notif</p>
              <p className="text-[11px] text-[#5C564E]">
                Dapatkan notifikasi di layar HP saat tagihan terbit.
              </p>
            </div>
            <Button
              size="sm"
              onClick={subscribeToPush}
              disabled={pushLoading}
              className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0 ml-2 rounded-lg shadow-2xs cursor-pointer"
            >
              {pushLoading ? "..." : "Aktifkan"}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#2C2825]/8">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                className={`p-3 px-4 flex gap-3 items-start transition-colors cursor-pointer ${
                  item.isRead
                    ? "bg-transparent opacity-65 hover:opacity-100 hover:bg-[#FAF8F5]"
                    : "bg-[#FAF2EA]/35 hover:bg-[#FAF2EA]/70"
                }`}
              >
                <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-white border border-[#2C2825]/10 shadow-2xs">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs font-bold text-[#1E1B18] truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-medium text-[#7A7369] shrink-0">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C564E] leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#7A7369] text-xs font-medium">
              Belum ada notifikasi saat ini.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
