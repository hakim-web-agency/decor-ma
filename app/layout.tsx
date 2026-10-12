import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DÉCOR.MA — أثاث وأقمشة مغربية حسب الطلب",
  description:
    "اكتشفوا الأقمشة والصالونات المغربية المصممة بعناية من DÉCOR.MA في فاس. احسبوا احتياجكم من الأمتار وأرسلوا طلبكم عبر واتساب.",
  metadataBase: new URL("https://decor.ma"),
  openGraph: {
    title: "DÉCOR.MA",
    description: "حرفة فاسية أصيلة، وأقمشة مختارة لبيتكم.",
    locale: "ar_MA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
