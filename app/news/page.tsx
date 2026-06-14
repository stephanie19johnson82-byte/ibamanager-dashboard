"use client";

import { useEffect, useState } from "react";
import { orderBy } from "firebase/firestore";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function NewsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCollection("events", [], [orderBy("date", "desc")]);
        setEvents(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load news");
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
            <h1 className="text-3xl font-semibold">News Feed</h1>
            <p className="mt-2 text-bml-muted">Latest imported league events and announcements.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading news…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : events.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No league news found.</div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id || event.name || event.type} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-xl font-semibold">{event.name || event.type || "League Update"}</h2>
                  <p className="text-sm text-bml-muted">{event.date || "Unknown date"}</p>
                  <p className="mt-3 text-white-75">{event.description || event.text || "No description available."}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
