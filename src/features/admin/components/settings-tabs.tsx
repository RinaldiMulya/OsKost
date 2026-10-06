"use client";

import { useState } from "react";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { PropertyForm } from "./property-form";
import { AdminDocs } from "./admin-docs";
import { NotificationPanel } from "./notification-panel";
import { User, Home, BookOpen, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsTabsProps {
  currentEmail: string;
  property: {
    id: string;
    name: string;
    address: string;
    features?: Record<string, unknown> | null;
  } | null;
  notificationStats: {
    totalSent: number;
    totalUnread: number;
    totalPushSubscriptions: number;
  };
}

export function SettingsTabs({
  currentEmail,
  property,
  notificationStats,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "property" | "docs" | "notifications">("profile");

  const tabs = [
    { id: "profile", label: "Profil & Keamanan", icon: User },
    { id: "property", label: "Profil Properti Kost", icon: Home },
    { id: "docs", label: "Panduan & Aturan", icon: BookOpen },
    { id: "notifications", label: "Status Notifikasi", icon: Bell },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs Selector Bar */}
      <div className="flex border-b border-zinc-800/80 gap-2 pb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "border-secondary text-secondary"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content Container */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              <ProfileForm currentEmail={currentEmail} />
              <PasswordForm />
            </motion.div>
          )}

          {activeTab === "property" && (
            <motion.div
              key="property"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto w-full"
            >
              {property ? (
                <PropertyForm property={property} />
              ) : (
                <div className="text-center py-10 bg-zinc-950/20 border border-zinc-800 rounded-2xl">
                  <p className="text-xs text-zinc-500">Properti utama belum dikonfigurasi.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "docs" && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <AdminDocs />
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto w-full"
            >
              <NotificationPanel stats={notificationStats} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
