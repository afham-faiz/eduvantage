import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eduvantage — Merchant Web",
  description: "Merchant-facing web app (placeholder).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
