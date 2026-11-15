import TopNav from "../components/TopNav";

// shortcut: /dev only works for editors of the Apps Script; replace with the /exec deployment URL so every viewer can see it.
// The Apps Script doGet must also call .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) or the iframe stays blank.
const EVENT_OPERATIONS_URL =
  "https://script.google.com/a/macros/planetindonesia.org/s/AKfycbywJjMZuJ_jSswApR1NzC_yH6zSw3ESmjNS5lC4Zllj/dev";

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
        <section className="overflow-hidden rounded-3xl border border-[#004B5C]/10 bg-white shadow-sm">
          <div className="border-b border-[#004B5C]/10 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-[#004B5C]/60">
                Opens with your planetindonesia.org Google account. If the
                view below stays blank, open the original.
              </p>

              <a
                href={EVENT_OPERATIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#004B5C] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#003D4A]"
              >
                Open Original ↗
              </a>
            </div>
          </div>

          <div className="bg-[#F7F0EC] p-3 sm:p-5">
            <div className="overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white">
              <iframe
                src={EVENT_OPERATIONS_URL}
                title="Event Operations"
                className="block h-[900px] w-full border-0"
                allowFullScreen
                loading="eager"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
