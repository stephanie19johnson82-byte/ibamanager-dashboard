"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";
import Link from "next/link";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeams() {
      try {
        const result = await fetchCollection("teams");
        setTeams(result);
      } catch (err) {
        // Firestore may not be configured locally; fallback to bundled sample JSON
        try {
          const res = await fetch('/sample-league.json');
          if (res.ok) {
            const json = await res.json();
            setTeams(json.teams || []);
            setError('Loaded sample data (Firestore not configured)');
          } else {
            setError(err instanceof Error ? err.message : 'Unable to load teams');
          }
        } catch (e) {
          setError(err instanceof Error ? err.message : 'Unable to load teams');
        }
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <Sidebar />
        <main className="space-y-6 rounded-[32px] border border-white/10 bg-bml-surface p-6 shadow-soft">
          <section className="page-header-card">
            <h1 className="text-3xl font-semibold">League Teams</h1>
            <p className="mt-2 text-bml-muted">Browse every franchise, conference, and team performance in the Basketball Managers League.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading teams…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : teams.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No teams imported yet. Use the admin import page to load league data.</div>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teams.map((team, index) => {
                const record = team.wins != null && team.losses != null ? `${team.wins}-${team.losses}` : "N/A";
                const value = team.value != null ? team.value : team.rank != null ? team.rank : "—";
                const name = team.abbrev || team.region || team.name || `Team ${index + 1}`;
                const owner = team.owner || team.ownerName || "League"
                return (
                  <div key={team.id || team.tid || index} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass transition hover:-translate-y-1 hover:shadow-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-bml-muted">Team</p>
                        <h2 className="mt-2 text-xl font-semibold">{name}</h2>
                      </div>
                      <div className="rounded-3xl bg-blue-500/15 px-3 py-2 text-sm text-blue-300">{record}</div>
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-bml-muted">
                          <p>Value: {value}</p>
                          <p>Owner: {owner}</p>
                        </div>
                        <div className="mt-4">
                          <Link href={`/teams/${team.id || team.tid || index}`} className="inline-block rounded-md bg-blue-600 px-3 py-2 text-sm text-white">View Team</Link>
                        </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
