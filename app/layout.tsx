import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basketball Managers League",
  description: "Premium basketball management dashboard for BML.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
