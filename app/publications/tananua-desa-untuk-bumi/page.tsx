import Link from "next/link";
import TopNav from "@/app/components/TopNav";

const TANANUA_URL =
  "https://www.tananua.org/dari-desa-untuk-bumi-spiritualitas-ekologis-dan-gerakan-konservasi-berbasis-komunitas-di-flores-2/";

export default function TananuaPublicationPage() {
  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* ===================================================== */}
        {/* BACK */}
        {/* ===================================================== */}

        <Link
          href="/publications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#730A2D] hover:underline"
        >
          ← Back to Publications
        </Link>

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <section className="mt-6">
          <span className="inline-flex rounded-full bg-[#004B5C]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#004B5C]">
            Tananua Flores
          </span>

          <h1 className="mt-4 max-w-5xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Dari Desa untuk Bumi: Spiritualitas Ekologis dan
            Gerakan Konservasi Berbasis Komunitas di Flores
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-black/50">
            <span>Journal / Article</span>
            <span>·</span>
            <span>2025</span>
            <span>·</span>
            <span>Community Conservation</span>
          </div>

          <p className="mt-4 max-w-4xl text-sm leading-6 text-black/60 md:text-base">
            Publikasi Tananua Flores mengenai gerakan konservasi
            berbasis komunitas di Flores.
          </p>
        </section>

        {/* ===================================================== */}
        {/* EMBED */}
        {/* ===================================================== */}

        <section className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white shadow-sm">
            <iframe
              src={TANANUA_URL}
              title="Tananua Flores - Dari Desa untuk Bumi"
              className="h-[80vh] min-h-[900px] w-full border-0"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>

        {/* ===================================================== */}
        {/* ORIGINAL SOURCE */}
        {/* ===================================================== */}

        <section className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
              Original Source
            </p>

            <p className="mt-1 text-sm text-black/55">
              Read the original publication directly on the
              Tananua Flores website.
            </p>
          </div>

          <a
            href={TANANUA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#004B5C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003D4A]"
          >
            View Original ↗
          </a>
        </section>
      </div>
    </main>
  );
}