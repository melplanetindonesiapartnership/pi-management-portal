import type { Metadata } from "next";
import TopNav from "../components/TopNav";

export const metadata: Metadata = {
  title: "Smart Patrol · Planet Indonesia",
};

// Peta Smart Patrol adalah aplikasi statis (Leaflet + Supabase) di public/smart-patrol/.
// Dimuat lewat iframe dari origin yang sama supaya panel Kelola Data dan filter tetap jalan apa adanya.
export default function SmartPatrolPage() {
  return (
    <main className="flex h-screen flex-col bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      <iframe
        src="/smart-patrol/index.html"
        title="Peta Smart Patrol Yayasan Planet Indonesia"
        className="w-full flex-1 border-0"
        allow="fullscreen"
      />
    </main>
  );
}
