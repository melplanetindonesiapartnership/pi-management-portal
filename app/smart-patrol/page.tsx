import type { Metadata } from "next";
import TopNav from "../components/TopNav";

export const metadata: Metadata = {
  title: "Smart Patrol · Planet Indonesia",
};

// Peta Smart Patrol adalah aplikasi statis (Leaflet + Supabase) di public/smart-patrol/.
// Dimuat lewat iframe dari origin yang sama supaya panel Kelola Data dan filter tetap jalan apa adanya.
// Peta memenuhi layar; TopNav tersembunyi dan turun saat kursor ke tepi atas
// (atau saat tab "Menu" difokus/diketuk di layar sentuh).
export default function SmartPatrolPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#F7F0EC] text-[#004B5C]">
      <iframe
        src="/smart-patrol/index.html"
        title="Peta Smart Patrol Yayasan Planet Indonesia"
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen"
      />

      {/* Zona hover tipis di tepi atas: iframe menelan event mouse, jadi pemicu harus di luar iframe. */}
      <div className="group absolute inset-x-0 top-0 z-50 h-3">
        <div className="-translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
          <TopNav />
        </div>

        <button
          type="button"
          aria-label="Tampilkan menu portal"
          className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg bg-[#004B5C]/90 px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 shadow-sm transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0"
        >
          Menu
        </button>
      </div>
    </main>
  );
}
