"use client";

import { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchDoc } from "../../lib/firestore";

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: playerId } = use(params);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchDoc("players", playerId);
        setPlayer(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load player");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <Sidebar />
        <main className="space-y-6 rounded-[32px] border border-white/10 bg-bml-surface p-6 shadow-soft">
          <section className="page-header-card">
            <h1 className="text-3xl font-semibold">Player Details</h1>
            <p className="mt-2 text-bml-muted">View imported player information from the BBGM export.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading player…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : !player ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Player not found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                  <h2 className="text-2xl font-semibold">{player.firstName} {player.lastName}</h2>
                  <p className="text-bml-muted">{player.position || player.pos || "N/A"} • Team {player.teamId ?? player.tid ?? "Unassigned"}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-bml-muted">
                    <div>Age: {player.age ?? "—"}</div>
                    <div>OVR: {player.ovr ?? player.ratings?.ovr ?? "—"}</div>
                    <div>POT: {player.pot ?? player.ratings?.pot ?? "—"}</div>
                    <div>Height: {Array.isArray(player.height) ? `${player.height[0]}-${player.height[1]}` : player.height ?? "—"}</div>
                    <div>Weight: {player.weight ?? "—"}</div>
                    <div>Contract: {player.contract?.amount ? `$${player.contract.amount} for ${player.contract?.years || 0} yrs` : "N/A"}</div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                  <h3 className="text-xl font-semibold mb-3">Ratings</h3>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-bml-muted">
                    {Object.entries(player.ratings || {}).map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-white/5 p-3">{key.toUpperCase()}: {value != null ? String(value) : "—"}</div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                  <h4 className="text-lg font-semibold">Injury</h4>
                  <p className="text-bml-muted mt-2">{player.injury?.type || player.injury || "None"}</p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                  <h4 className="text-lg font-semibold">Player JSON</h4>
                  <pre className="text-white-50 small mt-2 max-h-[320px] overflow-auto rounded-lg bg-[#02091a] p-4">{JSON.stringify(player, null, 2)}</pre>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
