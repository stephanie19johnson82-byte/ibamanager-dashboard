"use client";

import { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchDoc, fetchCollection } from "../../lib/firestore";
import Link from "next/link";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params);
  const [team, setTeam] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teamId) return;
    async function load() {
      try {
        const t = await fetchDoc("teams", teamId);
        setTeam(t);
        const players = await fetchCollection("players") as any[];
        const teamPlayers = players.filter((p) => String(p.teamId || p.tid || p.team) === String(teamId));
        setRoster(teamPlayers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load team");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [teamId]);

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <Sidebar />
        <main className="space-y-6 rounded-[32px] border border-white/10 bg-bml-surface p-6 shadow-soft">
          <section className="page-header-card">
            <h1 className="text-3xl font-semibold">Team</h1>
            <p className="mt-2 text-bml-muted">Team details and roster</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading team…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : !team ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Team not found.</div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                  <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                    <h2 className="text-2xl font-semibold">{team.region} {team.name}</h2>
                    <p className="text-bml-muted">{team.conference || "Conference"} • {team.division || "Division"}</p>
                    <div className="mt-4 text-sm text-bml-muted">
                      <p>Record: {team.wins ?? 0}-{team.losses ?? 0}</p>
                      <p>Value: {team.value ?? "—"}</p>
                      <p>Owner: {team.owner || team.ownerName || "League"}</p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                    <h3 className="text-xl font-semibold mb-3">Roster ({roster.length})</h3>
                    <div className="space-y-3">
                      {roster.map((p) => (
                        <div key={p.id || p.pid} className="rounded-md bg-[#071322]/60 p-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{p.firstName} {p.lastName}</div>
                            <div className="text-sm text-bml-muted">{p.position} • OVR {p.ovr ?? p.ov}</div>
                          </div>
                          <div>
                            <Link href={`/players/${p.id || p.pid}`}>View</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <aside className="space-y-4">
                  <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                    <h4 className="text-lg font-semibold">Financials</h4>
                    <p className="text-bml-muted mt-2">Arena Capacity: {team.arenaCapacity ?? "N/A"}</p>
                    <p className="text-bml-muted">Team Value: {team.value ?? 0}</p>
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                    <h4 className="text-lg font-semibold">History</h4>
                    <pre className="text-white-50 small mt-2">{JSON.stringify(team.history || [], null, 2)}</pre>
                  </div>
                </aside>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6">
                <h3 className="text-xl font-semibold mb-3">Team JSON</h3>
                <pre className="text-white-50 small max-h-[420px] overflow-auto rounded-lg bg-[#02091a] p-4">{JSON.stringify(team, null, 2)}</pre>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
