import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دخول الإدارة | DÉCOR.MA",
  description: "تسجيل الدخول إلى لوحة إدارة DÉCOR.MA.",
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
