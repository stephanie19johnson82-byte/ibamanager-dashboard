import DashboardPage from "@/components/dashboard/DashboardPage";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <Navbar />
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <Sidebar />
        <main className="rounded-[32px] border border-white/10 bg-transparent p-0 shadow-soft">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
