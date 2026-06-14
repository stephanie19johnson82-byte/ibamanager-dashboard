"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, ChartColumn, Newspaper, Store, Trophy, Upload, UserRound } from "lucide-react";
import FeatureCard from "@/components/dashboard/FeatureCard";
import NewsCard from "@/components/dashboard/NewsCard";
import QuickStatCard from "@/components/dashboard/QuickStatCard";
import { fetchCollection } from "@/app/lib/firestore";

const defaultNews = [
  {
    title: "Commissioner approves new trade deadline rules",
    summary: "League owners prepare for the most active deadline in BML history.",
    category: "Announcement",
    date: "Sep 18"
  },
  {
    title: "Rivalry week sets record viewership",
    summary: "Franchise markets heat up as owners chase championship runs.",
    category: "League News",
    date: "Sep 16"
  },
  {
    title: "Top prospects project as future MVPs",
    summary: "Scouts highlight the most promising players in preparation for the draft.",
    category: "Scouting",
    date: "Sep 12"
  }
];

const featureCards = [
  {
    icon: Upload,
    title: "Import BBGM Data",
    description: "Sync rosters, schedules, standings, awards and player data automatically from exported Basketball GM files.",
    href: "/admin",
    cta: "Import Now"
  },
  {
    icon: ArrowLeftRight,
    title: "Trade & Free Agency",
    description: "Negotiate trades, sign free agents and manage salary cap decisions.",
    href: "/trade-center",
    cta: "Open Trade Center"
  },
  {
    icon: Store,
    title: "Franchise Market",
    description: "Buy, sell and manage franchise ownership using league currency.",
    href: "/franchise-market",
    cta: "View Market"
  },
  {
    icon: Newspaper,
    title: "League News",
    description: "Stay updated with transactions, signings, championships and announcements.",
    href: "/news",
    cta: "Read News"
  },
  {
    icon: Trophy,
    title: "Standings",
    description: "Track conference rankings and playoff races.",
    href: "/standings",
    cta: "View Standings"
  },
  {
    icon: ChartColumn,
    title: "Analytics",
    description: "View advanced statistics, dynasty value and franchise ratings.",
    href: "/analytics",
    cta: "Open Analytics"
  }
];

const recentNews = [
  {
    title: "Commissioner approves new trade deadline rules",
    summary: "League owners prepare for the most active deadline in BML history.",
    category: "Announcement",
    date: "Sep 18"
  },
  {
    title: "Rivalry week sets record viewership",
    summary: "Franchise markets heat up as owners chase championship runs.",
    category: "League News",
    date: "Sep 16"
  },
  {
    title: "Top prospects project as future MVPs",
    summary: "Scouts highlight the most promising players in preparation for the draft.",
    category: "Scouting",
    date: "Sep 12"
  }
];

export default function DashboardPage() {
  const [stats, setStats] = useState({ teams: 0, players: 0, drafts: 0, freeAgents: 0 });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [teams, players, draftPicks, freeAgents, newsEvents] = await Promise.all([
          fetchCollection("teams"),
          fetchCollection("players"),
          fetchCollection("draftPicks"),
          fetchCollection("freeAgents"),
          fetchCollection("events")
        ]);

        setStats({
          teams: teams.length,
          players: players.length,
          drafts: draftPicks.length,
          freeAgents: freeAgents.length
        });
        setEvents(newsEvents.slice(0, 3));
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    }

    loadDashboard();
  }, []);

  const quickStats = [
    { label: "Active Franchises", value: stats.teams.toString(), icon: Trophy, accent: "blue-400" },
    { label: "Players", value: stats.players.toString(), icon: UserRound, accent: "blue-300" },
    { label: "Pending Trades", value: stats.drafts.toString(), icon: ArrowLeftRight, accent: "blue-300" },
    { label: "Free Agents", value: stats.freeAgents.toString(), icon: Store, accent: "blue-300" }
  ];

  const recentNews = events.length > 0 ? events.map((item: any) => ({
    title: item.type || item.name || item.category || "League Update",
    summary: item.description || item.text || "Imported league event.",
    category: item.category || item.type || "News",
    date: item.date || item.season || "TBD"
  })) : defaultNews;

  return (
    <div className="space-y-8 px-4 pb-8 lg:px-6">
      <section className="rounded-[20px] border border-white/10 bg-bml-surface p-8 shadow-glass">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Basketball Managers League</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Basketball Managers League</h1>
            <p className="max-w-xl text-lg leading-8 text-bml-muted">
              Import Basketball GM exports, manage your franchise, build dynasty value, and compete with owners around the league.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/admin" className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110">
                Import BBGM File
              </a>
              <a href="/teams" className="inline-flex items-center justify-center rounded-3xl bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View Teams
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentNews.slice(0, 2).map((item) => (
              <div key={item.title} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{item.category}</p>
                <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-bml-muted">{item.summary}</p>
                <p className="mt-4 text-xs text-bml-muted">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <QuickStatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} accent={stat.accent} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {featureCards.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[20px] border border-white/10 bg-bml-surface p-6 shadow-glass">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent News</h2>
              <p className="text-sm text-bml-muted">Latest announcements and league updates.</p>
            </div>
            <a href="/news" className="text-sm text-blue-300 transition hover:text-white">View all</a>
          </div>
          <div className="mt-6 space-y-4">
            {recentNews.map((item) => (
              <NewsCard key={item.title} {...item} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[20px] border border-white/10 bg-bml-surface p-6 shadow-glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
                <p className="text-sm text-bml-muted">Active trade activity across the league.</p>
              </div>
              <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-blue-300">Live</span>
            </div>
            <div className="mt-6 overflow-hidden rounded-[20px] border border-white/5">
              <table className="min-w-full divide-y divide-white/10 text-sm text-white">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.25em] text-bml-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Team A</th>
                    <th className="px-4 py-3">Team B</th>
                    <th className="px-4 py-3">Assets</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { date: "Sep 18", teamA: "Raptors", teamB: "Bruisers", assets: "2 picks", status: "Pending" },
                    { date: "Sep 16", teamA: "Gliders", teamB: "Seawolves", assets: "Player + pick", status: "Accepted" },
                    { date: "Sep 14", teamA: "Guardians", teamB: "Falcons", assets: "Cash + player", status: "Review" }
                  ].map((row) => (
                    <tr key={row.date} className="transition hover:bg-white/5">
                      <td className="px-4 py-4 text-sm text-bml-muted">{row.date}</td>
                      <td className="px-4 py-4">{row.teamA}</td>
                      <td className="px-4 py-4">{row.teamB}</td>
                      <td className="px-4 py-4 text-bml-muted">{row.assets}</td>
                      <td className="px-4 py-4 text-sm text-blue-300">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-bml-surface p-6 shadow-glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Top Dynasty Rankings</h2>
                <p className="text-sm text-bml-muted">Leading franchises by dynasty value.</p>
              </div>
              <a href="/franchise-market" className="text-sm text-blue-300 transition hover:text-white">See rankings</a>
            </div>
            <div className="mt-6 overflow-hidden rounded-[20px] border border-white/5">
              <table className="min-w-full divide-y divide-white/10 text-sm text-white">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.25em] text-bml-muted">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Dynasty Value</th>
                    <th className="px-4 py-3">Champs</th>
                    <th className="px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { rank: 1, team: "Raptors", value: "97.1", champs: 3, owner: "J. Rivera" },
                    { rank: 2, team: "Falcons", value: "92.6", champs: 2, owner: "A. Miles" },
                    { rank: 3, team: "Gliders", value: "90.4", champs: 1, owner: "M. Knox" }
                  ].map((row) => (
                    <tr key={row.rank} className="transition hover:bg-white/5">
                      <td className="px-4 py-4 text-bml-muted">{row.rank}</td>
                      <td className="px-4 py-4">{row.team}</td>
                      <td className="px-4 py-4 text-white">{row.value}</td>
                      <td className="px-4 py-4 text-bml-muted">{row.champs}</td>
                      <td className="px-4 py-4 text-bml-muted">{row.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
