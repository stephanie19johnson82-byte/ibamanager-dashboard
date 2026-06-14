"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection, fetchDoc } from "../lib/firestore";

export default function AnalyticsPage() {
  const [topTeams, setTopTeams] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [playoffs, setPlayoffs] = useState<any[]>([]);
  const [gameAttributes, setGameAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [leagueSettings, teams, players, playoffSeries, attrs] = await Promise.all([
          fetchDoc("settings", "leagueSettings"),
          fetchCollection("teams", [], [orderBy("wins", "desc")]),
          fetchCollection("players", [], [orderBy("ovr", "desc")]),
          fetchCollection("playoffSeries"),
          fetchCollection("gameAttributes")
        ]);

        setSettings(leagueSettings);
        setTopTeams(teams.slice(0, 5));
        setTopPlayers(players.slice(0, 5));
        setPlayoffs(playoffSeries);
        setGameAttributes(attrs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <Sidebar />
        <main className="space-y-6 rounded-[32px] border border-white/10 bg-bml-surface p-6 shadow-soft">
          <section className="page-header-card">
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="mt-2 text-bml-muted">View advanced statistics, dynasty value, and team performance metrics.</p>
          </section>
          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading analytics…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : (
            <section className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                <h2 className="text-xl font-semibold">League Settings</h2>
                {settings ? (
                  <div className="mt-4 space-y-2 text-sm text-bml-muted">
                    <div>Salary Cap: {settings.salaryCap ?? "N/A"}</div>
                    <div>Luxury Tax: {settings.luxuryTax ?? "N/A"}</div>
                    <div>Playoff Teams: {settings.playoffTeams ?? "N/A"}</div>
                    <div>Draft Rounds: {settings.draftRounds ?? "N/A"}</div>
                    <div>Game Attributes: {gameAttributes.length}</div>
                  </div>
                ) : (
                  <p className="mt-4 text-bml-muted">No settings imported yet.</p>
                )}
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                <h2 className="text-xl font-semibold">Top Teams</h2>
                {topTeams.length === 0 ? (
                  <p className="mt-4 text-bml-muted">No team data loaded.</p>
                ) : (
                  <div className="mt-4 space-y-3 text-sm text-bml-muted">
                    {topTeams.map((team) => (
                      <div key={team.id || team.tid} className="rounded-3xl bg-white/5 p-4">
                        <p className="text-white">{team.region} {team.name}</p>
                        <p>Record: {team.wins ?? 0}-{team.losses ?? 0}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                <h2 className="text-xl font-semibold">Top Players</h2>
                {topPlayers.length === 0 ? (
                  <p className="mt-4 text-bml-muted">No player data loaded.</p>
                ) : (
                  <div className="mt-4 space-y-3 text-sm text-bml-muted">
                    {topPlayers.map((player) => (
                      <div key={player.id || player.pid} className="rounded-3xl bg-white/5 p-4">
                        <p className="text-white">{player.firstName} {player.lastName}</p>
                        <p>OVR: {player.ovr ?? player.ratings?.ovr ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
              <h2 className="text-xl font-semibold">Imported Playoff Series</h2>
              {playoffs.length === 0 ? (
                <p className="mt-4 text-bml-muted">No playoff series imported yet.</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm text-bml-muted">
                  {playoffs.slice(0, 5).map((series, index) => (
                    <li key={series.id || index} className="rounded-3xl bg-white/5 p-4">
                      <p className="text-white">{series.name || series.round || "Playoff Series"}</p>
                      <p>{series.season ? `Season ${series.season}` : "Season unknown"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
              <h2 className="text-xl font-semibold">Game Attributes</h2>
              {gameAttributes.length === 0 ? (
                <p className="mt-4 text-bml-muted">No game settings imported yet.</p>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-bml-muted">
                  <p>{gameAttributes.length} game attribute records imported.</p>
                  <pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-[#02091a] p-4 text-xs text-bml-muted">{JSON.stringify(gameAttributes.slice(0, 3), null, 2)}</pre>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
