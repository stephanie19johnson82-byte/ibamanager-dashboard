"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function AwardsPage() {
  const [awards, setAwards] = useState<any[]>([]);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [awardData, hofData] = await Promise.all([
          fetchCollection("awards", [], [orderBy("season", "desc")]),
          fetchCollection("hallOfFame", [], [orderBy("season", "desc")])
        ]);
        setAwards(awardData);
        setHallOfFame(hofData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load awards");
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
            <h1 className="text-3xl font-semibold">Awards & Hall of Fame</h1>
            <p className="mt-2 text-bml-muted">Review imported awards, honors, and franchise hall of fame history.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading awards…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-2xl font-semibold">Award Winners</h2>
                  {awards.length === 0 ? (
                    <p className="mt-4 text-bml-muted">No awards imported yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {awards.map((award) => (
                        <div key={award.id || `${award.season}-${award.type || award.name}`} className="rounded-3xl bg-white/5 p-4">
                          <p className="text-sm text-bml-muted">{award.season || "Season"} • {award.type || award.name}</p>
                          <p className="mt-2 text-white">{award.winner || award.player || award.team || award.recipient || "Unknown"}</p>
                          {award.position && <p className="text-sm text-bml-muted">Position: {award.position}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-2xl font-semibold">Hall of Fame</h2>
                  {hallOfFame.length === 0 ? (
                    <p className="mt-4 text-bml-muted">No hall of fame entries imported yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {hallOfFame.map((entry) => (
                        <div key={entry.id || entry.pid || `${entry.season}-${entry.name}`} className="rounded-3xl bg-white/5 p-4">
                          <p className="text-sm text-bml-muted">{entry.season || "Season"}</p>
                          <p className="mt-1 text-white">{entry.name || entry.player || entry.team || "Untitled"}</p>
                          <p className="text-sm text-bml-muted">{entry.position || entry.role || "Honored"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
