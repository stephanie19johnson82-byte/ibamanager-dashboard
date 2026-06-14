import "./globals.css";
import type { Metadata } from "next";
import packageJson from "../package.json";

export const metadata: Metadata = {
  title: `Basketball Managers League v${packageJson.version}`,
  description: "Premium basketball management dashboard for BML.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <div className="fixed bottom-4 right-4 z-50 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200 shadow-lg">
          {`v${packageJson.version}`}
        </div>
      </body>
    </html>
  );
}
