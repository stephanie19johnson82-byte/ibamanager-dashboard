"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function SchedulePage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCollection("schedule", [], [orderBy("date", "asc")]);
        setGames(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load schedule");
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
            <h1 className="text-3xl font-semibold">Schedule</h1>
            <p className="mt-2 text-bml-muted">Review imported game dates and matchup results.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading schedule…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : games.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No schedule imported yet.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {games.map((game) => (
                <div key={game.id || `${game.season}-${game.gid}`} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{game.awayTid} @ {game.homeTid}</h2>
                      <p className="text-sm text-bml-muted">{game.date || "TBD"}</p>
                    </div>
                    <div className="text-right text-white">
                      <div>{game.awayScore ?? "-"} - {game.homeScore ?? "-"}</div>
                      <div className="text-sm text-bml-muted">{game.status || "Scheduled"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
