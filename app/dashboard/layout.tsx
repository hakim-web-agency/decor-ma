import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | DÉCOR.MA",
  description: "إدارة طلبات DÉCOR.MA وطلبات الأقمشة ومعلومات المتجر.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
