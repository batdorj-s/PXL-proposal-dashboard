import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Маркетингийн Санал — Dashboard",
  description: "Marketing proposal builder for managers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
