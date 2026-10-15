import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | DÉCOR.MA",
  description: "Manage DÉCOR.MA orders, fabric requests, and store details.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
