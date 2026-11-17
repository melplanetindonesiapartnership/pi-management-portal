import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "../components/TopNav";

export const metadata: Metadata = {
  title: "Monitoring · Planet Indonesia",
};

type MonitoringTool = {
  href: string;
  label: string;
  status: "Live" | "Indikatif";
  title: string;
  description: string;
  sources: string[];
  image: string;
};

// Pratinjau berupa screenshot statis (public/monitoring/thumbs/) agar hub tetap ringan;
// perbarui gambarnya bila tampilan tool berubah.
const monitoringTools: MonitoringTool[] = [
  {
    href: "/monitoring/smart-patrol",
    label: "Peta Patroli",
    status: "Live",
    title: "SMART Patrol",
    description:
      "Peta hasil patroli SMART bersama mitra, lengkap dengan filter, ringkasan effort patroli, dan panel Kelola Data untuk impor laporan.",
    sources: ["Supabase", "Leaflet", "Diperbarui mitra"],
    image: "/monitoring/thumbs/smart-patrol.png",
  },
  {
    href: "/monitoring/peta-mitra-pesisir",
    label: "Peta Wilayah Kelola",
    status: "Indikatif",
    title: "Peta Mitra Pesisir ORCA Program 2027–2029",
    description:
      "Zona tangkap tradisional (Jalur I), batas desa, dan mangrove di lokasi KUL, YCMM, Bantaya, dan JAPESDA, dengan profil dan strategi Model Inti tiap mitra.",
    sources: ["BIG", "Global Mangrove Watch", "4 mitra"],
    image: "/monitoring/thumbs/peta-mitra-pesisir.png",
  },
  {
    href: "/monitoring/data-source-mel",
    label: "Dashboard",
    status: "Live",
    title: "Data Source MEL Partnership",
    description:
      "Peta interaktif Nusantara (Genially) dan dashboard kinerja kemitraan dari data MEL di Google Sheets.",
    sources: ["Google Sheets", "Looker Studio", "Genially"],
    image: "/monitoring/thumbs/data-source-mel.png",
  },
];

export default function MonitoringPage() {
  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      <header className="pi-pattern-band border-b border-[#004B5C]/10 bg-[#004B5C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FFB432]">
            Monitoring
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Monitoring & Data Lapangan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
            Peta patroli, wilayah kelola mitra, dan data MEL yang dikumpulkan
            bersama mitra dan masyarakat. Pilih salah satu untuk membukanya.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
              Tools
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Pilih tampilan monitoring
            </h2>
          </div>

          <p className="text-sm text-black/50">
            {monitoringTools.length} tools
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {monitoringTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004B5C]"
            >
              <div className="relative aspect-video overflow-hidden bg-[#004B5C]/5">
                {/* eslint-disable-next-line @next/next/no-img-element -- pola sama dengan halaman Publications */}
                <img
                  src={tool.image}
                  alt={`Pratinjau ${tool.title}`}
                  className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                />

                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    tool.status === "Live"
                      ? "bg-[#DDE9EB] text-[#004B5C]"
                      : "bg-[#FDEBCB] text-[#730A2D]"
                  }`}
                >
                  {tool.status}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex w-fit rounded-full bg-[#004B5C]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#730A2D]">
                  {tool.label}
                </span>

                <h3 className="mt-3 text-lg font-semibold leading-7">
                  {tool.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/55">
                  {tool.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tool.sources.map((source) => (
                    <span
                      key={source}
                      className="rounded-md border border-[#004B5C]/10 px-2 py-0.5 text-[11px] text-[#004B5C]/70"
                    >
                      {source}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004B5C] px-4 py-2.5 text-xs font-semibold text-white transition group-hover:bg-[#003D4A]">
                    Buka →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-[#004B5C]/10 pt-5 pb-8">
          <p className="text-xs text-[#004B5C]/45">
            Planet Indonesia · Monitoring
          </p>
        </div>
      </div>
    </main>
  );
}
