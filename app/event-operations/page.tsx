import TopNav from "../components/TopNav";
import { EVENT_OPERATIONS_URL } from "../lib/links";

// Fallback page for direct visits to /event-operations; the TopNav menu opens the app in a new tab.

export default function EventOperationsPage() {
  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      {/* HEADER */}
      <header className="pi-pattern-band border-b border-[#004B5C]/10 bg-[#004B5C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
            Planet Indonesia
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Event Operations
          </h1>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="rounded-3xl border border-[#004B5C]/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
            Google Apps Script
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#004B5C]">
            Open Event Operations
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#004B5C]/70">
            Event Operations opens in a new tab with your
            planetindonesia.org Google account.
          </p>

          <a
            href={EVENT_OPERATIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#004B5C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#003D4A]"
          >
            Open Event Operations ↗
          </a>

          <p className="mt-6 max-w-2xl text-xs leading-5 text-[#004B5C]/50">
            Seeing &quot;You need access&quot;? Switch to your
            planetindonesia.org account in the Google account menu (top
            right of the new tab), or open this link in a browser profile
            signed in with that account.
          </p>
        </section>
      </div>
    </main>
  );
}
