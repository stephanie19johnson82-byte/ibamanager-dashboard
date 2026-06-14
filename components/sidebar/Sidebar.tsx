"use client";

import { LayoutDashboard, Users, UserRound, Trophy, Calendar, Newspaper, ArrowLeftRight, Store, ChartColumn, Settings, LogOut, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/players", label: "Players", icon: UserRound },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/trade-center", label: "Trade Center", icon: ArrowLeftRight },
  { href: "/free-agency", label: "Free Agency", icon: Store },
  { href: "/franchise-market", label: "Franchise Market", icon: Store },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/finances", label: "Finances", icon: ChartColumn },
  { href: "/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/admin", label: "Admin Panel", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex h-screen sticky top-0 w-[280px] flex-col gap-6 px-4 py-6 bg-bml-surface shadow-glass">
      <div className="space-y-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">🏀 Basketball Managers League</p>
          <p className="text-sm text-bml-muted mt-3 leading-6">League management, dynasty value & ownership</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li whileHover={{ x: 6 }} key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm text-white transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5 text-blue-300 transition group-hover:text-white" />
                  <span>{item.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-lg">JD</div>
          <div>
            <p className="font-semibold">Jordan Davis</p>
            <p className="text-sm text-bml-muted">Commissioner</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">Settings</button>
          <button className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/20">Logout</button>
        </div>
      </div>
    </aside>
  );
}
