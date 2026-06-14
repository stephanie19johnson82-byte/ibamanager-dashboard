"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function StandingsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCollection("teams", [], [orderBy("wins", "desc")]);
        setTeams(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load standings");
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
            <h1 className="text-3xl font-semibold">Standings</h1>
            <p className="mt-2 text-bml-muted">Review league standings and team records.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading standings…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : teams.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No teams imported yet.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {teams.map((team) => (
                <div key={team.id || team.tid} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{team.region} {team.name}</h2>
                    <p className="text-sm text-bml-muted">{team.conference || "Conference"} • {team.division || "Division"}</p>
                  </div>
                  <div className="text-right text-sm text-white">
                    <div>{team.wins ?? 0} - {team.losses ?? 0}</div>
                    <div className="text-bml-muted">Value {team.value ?? "—"}</div>
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
