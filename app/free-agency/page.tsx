"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { fetchCollection } from "../lib/firestore";

export default function FreeAgencyPage() {
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCollection("freeAgents");
        setFreeAgents(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load free agents");
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
            <h1 className="text-3xl font-semibold">Free Agents</h1>
            <p className="mt-2 text-bml-muted">Browse all imported free agent players from the league export.</p>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">Loading free agents…</div>
          ) : error ? (
            <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-center text-red-300">{error}</div>
          ) : freeAgents.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 text-center text-bml-muted">No free agents imported.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {freeAgents.map((agent) => (
                <div key={agent.id || agent.pid} className="rounded-[20px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-glass">
                  <h2 className="text-xl font-semibold">{agent.firstName || agent.name || "Free Agent"} {agent.lastName || ""}</h2>
                  <p className="text-sm text-bml-muted">{agent.position || agent.pos || "Unknown"}</p>
                  <p className="mt-3 text-white-75">Available at ${agent.contract?.amount ?? "N/A"} for {agent.contract?.years ?? 0} years</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
