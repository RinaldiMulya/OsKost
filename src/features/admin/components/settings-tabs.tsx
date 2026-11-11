"use client";

import { useState } from "react";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { PropertyForm } from "./property-form";
import { AdminDocs } from "./admin-docs";
import { NotificationPanel } from "./notification-panel";
import { PaymentSettingsForm } from "./payment-settings-form";
import { SubscriptionCard } from "./subscription-card";
import { User, Home, BookOpen, Bell, CreditCard, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PropertyProfile } from "../admin-service";

interface SettingsTabsProps {
  currentEmail: string;
  property: PropertyProfile | null;
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
  const [activeTab, setActiveTab] = useState<
    "profile" | "property" | "bank" | "subscription" | "docs" | "notifications"
  >("subscription");

  const tabs = [
    { id: "subscription", label: "Paket Langganan SaaS", icon: Zap },
    { id: "bank", label: "Metode Pembayaran Sewa", icon: CreditCard },
    { id: "profile", label: "Profil & Keamanan", icon: User },
    { id: "property", label: "Profil Properti Kost", icon: Home },
    { id: "docs", label: "Panduan & Aturan", icon: BookOpen },
    { id: "notifications", label: "Status Notifikasi", icon: Bell },
  ] as const;

  const currentPlanTier = property?.subscription?.planTier ?? "STARTER";

  return (
    <div className="space-y-6">
      {/* Tabs Selector Bar */}
      <div className="flex border-b border-border gap-2 pb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content Container */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "subscription" && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <SubscriptionCard
                subscription={property?.subscription}
                roomsCount={property?.roomsCount ?? 11}
                features={property?.features}
              />
            </motion.div>
          )}

          {activeTab === "bank" && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto w-full"
            >
              {property ? (
                <PaymentSettingsForm
                  propertyId={property.id}
                  currentPlanTier={currentPlanTier}
                  initialBankName={property.bankName}
                  initialBankAccountNumber={property.bankAccountNumber}
                  initialBankAccountHolder={property.bankAccountHolder}
                  initialBankAccountInfo={property.bankAccountInfo}
                  initialQrisImageUrl={property.qrisImageUrl}
                  initialIsMidtransActive={property.isMidtransActive}
                  initialMidtransMerchantId={property.midtransMerchantId}
                  initialMidtransClientKey={property.midtransClientKey}
                  hasMidtransServerKey={property.hasMidtransServerKey}
                  maskedMidtransServerKey={property.maskedMidtransServerKey}
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                />
              ) : (
                <div className="text-center py-10 bg-card border border-border rounded-2xl shadow-xs">
                  <p className="text-sm font-medium text-muted-foreground">
                    Properti belum dikonfigurasi.
                  </p>
                </div>
              )}
            </motion.div>
          )}

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
                <div className="text-center py-10 bg-card border border-border rounded-2xl shadow-xs">
                  <p className="text-sm font-medium text-muted-foreground">
                    Properti utama belum dikonfigurasi.
                  </p>
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
