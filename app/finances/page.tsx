"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection, fetchDoc } from "../lib/firestore";

export default function FinancesPage() {
  const [settings, setSettings] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [settingsDoc, teamList] = await Promise.all([
          fetchDoc("settings", "leagueSettings"),
          fetchCollection("teams", [], [orderBy("value", "desc")])
        ]);
        setSettings(settingsDoc);
        setTeams(teamList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load finances");
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
            <h1 className="text-3xl font-semibold">Finances</h1>
            <p className="mt-2 text-bml-muted">Imported league financial settings and team market values.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading finances…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-2xl font-semibold">League Settings</h2>
                  {settings ? (
                    <div className="mt-4 space-y-3 text-sm text-bml-muted">
                      <div>Salary Cap: {settings.salaryCap ?? "N/A"}</div>
                      <div>Luxury Tax: {settings.luxuryTax ?? "N/A"}</div>
                      <div>Season Length: {settings.seasonLength ?? "N/A"}</div>
                      <div>Playoff Teams: {settings.playoffTeams ?? "N/A"}</div>
                      <div>Draft Rounds: {settings.draftRounds ?? "N/A"}</div>
                      <div>Trade Deadline: {settings.tradeDeadline ?? "N/A"}</div>
                    </div>
                  ) : (
                    <p className="mt-4 text-bml-muted">No league settings imported yet.</p>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-2xl font-semibold">Top Team Values</h2>
                  {teams.length === 0 ? (
                    <p className="mt-4 text-bml-muted">No teams imported yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {teams.slice(0, 5).map((team) => (
                        <div key={team.id || team.tid} className="rounded-3xl bg-white/5 p-4">
                          <p className="text-sm text-bml-muted">{team.region} {team.name}</p>
                          <p className="mt-1 text-white">Value: {team.value ?? "N/A"}</p>
                          <p className="text-sm text-bml-muted">Record: {team.wins ?? 0}-{team.losses ?? 0}</p>
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
