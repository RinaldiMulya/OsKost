import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan Keluhan | Admin Smartkost",
  description:
    "Kelola dan pantau laporan kerusakan fasilitas dari penghuni kost.",
};

export default function AdminReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
