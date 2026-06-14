"use client";

import { Bell, Search, UserRound } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-bml-surface/95 border-b border-white/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Season 2067</p>
          <p className="text-sm text-white/80">Preseason</p>
        </div>

        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bml-muted" />
            <input
              placeholder="Search players, teams, picks, free agents"
              className="w-full rounded-3xl border border-white/10 bg-[#0f172a] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.03 }} className="relative rounded-2xl bg-white/5 p-3 text-white transition hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
          </motion.button>
          <div className="rounded-2xl bg-[#111925] px-4 py-3 text-sm text-white">
            <span className="block text-bml-muted text-xs">Balance</span>
            <span className="font-semibold">200 TI</span>
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-white">JD</div>
            <span className="text-sm text-white">Jordan</span>
          </div>
        </div>
      </div>
    </header>
  );
}
