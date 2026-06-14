"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCollection("players", [], [orderBy("ovr", "desc")]);
        setPlayers(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load players");
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
            <h1 className="text-3xl font-semibold">Players</h1>
            <p className="mt-2 text-bml-muted">Browse imported Basketball GM players and franchise rosters.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading players…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : players.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No players imported yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <div key={player.id || player.pid} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-xl font-semibold">{player.firstName} {player.lastName}</h2>
                  <p className="text-sm text-bml-muted">{player.pos || player.position || "N/A"}</p>
                  <div className="mt-4 space-y-2 text-sm text-bml-muted">
                    <p>Team: {player.teamId ?? player.tid ?? "Unassigned"}</p>
                    <p>OVR: {player.ovr ?? player.ratings?.ovr ?? "—"}</p>
                    <p>POT: {player.pot ?? player.ratings?.pot ?? "—"}</p>
                    <p>Contract: {player.contract?.amount ? `$${player.contract.amount}` : "N/A"} / {player.contract?.years || 0} years</p>
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
