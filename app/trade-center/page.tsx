"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function TradeCenterPage() {
  const [draftPicks, setDraftPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCollection("draftPicks");
        setDraftPicks(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trade center");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <Sidebar />
        <main className="space-y-6 rounded-[32px] border border-white/10 bg-bml-surface p-6 shadow-soft">
          <section className="page-header-card">
            <h1 className="text-3xl font-semibold">Trade Center</h1>
            <p className="mt-2 text-bml-muted">Draft picks and trade assets imported from the BBGM export.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading trade data…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : draftPicks.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No draft picks imported yet.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {draftPicks.map((pick) => (
                <div key={pick.id || `${pick.season}-${pick.round}-${pick.pick}`} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-xl font-semibold">{pick.season} Round {pick.round}</h2>
                  <p className="text-sm text-bml-muted">Pick {pick.pick} • {pick.tid ?? pick.team ?? "Unknown team"}</p>
                  <p className="mt-3 text-white-75">{pick.description || pick.notes || "No additional pick details."}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
