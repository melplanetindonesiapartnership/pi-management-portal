import Link from "next/link";
import TopNav from "./TopNav";

// Halaman tool statis (public/) yang memenuhi layar lewat iframe dari origin yang sama.
// TopNav tersembunyi dan turun saat kursor ke tepi atas (atau saat tab "Menu" difokus/diketuk di layar sentuh).
export default function FullscreenEmbed({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <main className="relative h-screen overflow-hidden bg-[#F7F0EC] text-[#004B5C]">
      <iframe
        src={src}
        title={title}
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

      {/* Tengah bawah: sudut kiri/kanan bawah dipakai legenda, skala, dan atribusi peta. */}
      <Link
        href="/monitoring"
        className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#004B5C]/90 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#004B5C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB432]"
      >
        ← Monitoring
      </Link>
    </main>
  );
}
