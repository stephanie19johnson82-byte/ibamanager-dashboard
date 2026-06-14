"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function TransactionsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [eventData, historyData] = await Promise.all([
          fetchCollection("events", [], [orderBy("date", "desc")]),
          fetchCollection("history", [], [orderBy("season", "desc")])
        ]);
        setEvents(eventData);
        setHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load transaction history");
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
            <h1 className="text-3xl font-semibold">Transactions</h1>
            <p className="mt-2 text-bml-muted">Imported trade history, game events, and season summaries.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading transaction data…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-2xl font-semibold">Recent Events</h2>
                  {events.length === 0 ? (
                    <p className="mt-4 text-bml-muted">No events imported yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {events.map((event) => (
                        <div key={event.id || `${event.category}-${event.date}`} className="rounded-3xl bg-white/5 p-4">
                          <p className="text-sm text-bml-muted">{event.date || "Date unknown"} • {event.category || event.type}</p>
                          <p className="mt-1 text-white">{event.description || event.text || event.name || "Event details"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-2xl font-semibold">Season History</h2>
                  {history.length === 0 ? (
                    <p className="mt-4 text-bml-muted">No history imported yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {history.map((entry) => (
                        <div key={entry.id || `${entry.season}-${entry.summary}`} className="rounded-3xl bg-white/5 p-4">
                          <p className="text-sm text-bml-muted">{entry.season || "Season"}</p>
                          <p className="mt-1 text-white">{entry.summary || JSON.stringify(entry)}</p>
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
