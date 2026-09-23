import TopNav from "../components/TopNav";

const LOOKER_STUDIO_URL =
  "https://datastudio.google.com/embed/reporting/cf086185-934e-411a-813c-ac00bf247df0/page/p_xtpijavw2d";

export default function MonitoringPage() {
  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      {/* =========================================================
          TOP NAVIGATION
         ========================================================= */}
      <TopNav />

      {/* =========================================================
          HEADER
         ========================================================= */}
      <header className="border-b border-[#004B5C]/10 bg-[#004B5C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
            Planet Indonesia
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Data Source MEL Partnership
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Monitoring data and partnership performance dashboard.
          </p>
        </div>
      </header>

      {/* =========================================================
          MAIN
         ========================================================= */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* =======================================================
            DASHBOARD
           ======================================================= */}
        <section className="overflow-hidden rounded-3xl border border-[#004B5C]/10 bg-white shadow-sm">

          {/* Dashboard header */}
          <div className="border-b border-[#004B5C]/10 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
                  Monitoring
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#004B5C]">
                  Partner Data Dashboard
                </h2>
              </div>

              <div className="inline-flex w-fit rounded-full bg-[#D9F0F0] px-4 py-2 text-xs font-semibold text-[#004B5C]">
                Source: Google Sheets
              </div>

            </div>
          </div>

          {/* =====================================================
              LOOKER STUDIO IFRAME
             ===================================================== */}
          <div className="bg-[#F7F0EC] p-3 sm:p-5">

            <div className="overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white">

              <iframe
                src={LOOKER_STUDIO_URL}
                title="Partner Data Dashboard"
                className="block h-[900px] w-full border-0"
                allowFullScreen
                loading="eager"
              />

            </div>
          </div>

        </section>

        {/* =======================================================
            DATA ARCHITECTURE
           ======================================================= */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">

          {/* Source */}
          <div className="rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
              Source
            </p>

            <h3 className="mt-2 text-base font-semibold text-[#004B5C]">
              Google Drive
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#004B5C]/60">
              Monitoring datasets maintained by MEL and partners.
            </p>

          </div>

          {/* Data layer */}
          <div className="rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
              Data layer
            </p>

            <h3 className="mt-2 text-base font-semibold text-[#004B5C]">
              Google Sheets
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#004B5C]/60">
              Structured monitoring tables used as the dashboard source.
            </p>

          </div>

          {/* Visualization */}
          <div className="rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
              Visualization
            </p>

            <h3 className="mt-2 text-base font-semibold text-[#004B5C]">
              Looker Studio
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#004B5C]/60">
              Interactive monitoring and partnership data visualization.
            </p>

          </div>

        </section>

        {/* =======================================================
            FOOTER
           ======================================================= */}
        <div className="mt-8 border-t border-[#004B5C]/10 pt-5 pb-8">

          <div className="flex flex-col gap-2 text-xs text-[#004B5C]/45 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Planet Indonesia · Data Source MEL Partnership
            </p>

            <p>
              Monitoring data visualization
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}