import Link from "next/link";
import TopNav from "../components/TopNav";

type LearningReport = {
  slug: string;
  title: string;
  category: string;
  description: string;
  status: "Available" | "Coming soon";
  image?: string;
};

const learningReports: LearningReport[] = [
  {
    slug: "ilomata-forest-loss-impact",
    title: "Ilomata Forest Loss Impact",
    category: "Impact Assessment",
    description:
      "Kajian dampak pendampingan terhadap tutupan hutan di Desa Ilomata.",
    status: "Available",
    image: "/learning-reports/ilomata-cover.jpg",
  },

  {
    slug: "mentawai-community-forest",
    title: "Mentawai Community Forest",
    category: "Impact Assessment",
    description:
      "Kajian mengenai hutan masyarakat di Kepulauan Mentawai dan perubahan tutupan hutan dalam konteks tekanan industri.",
    status: "Available",
    image: "/learning-reports/mentawai-cover.png",
  },

  {
    slug: "tananua-impact-assessment",
    title: "Tananua Impact Assessment",
    category: "Impact Assessment",
    description:
      "Kajian hasil program dan pembelajaran dari proses pendampingan bersama Tananua.",
    status: "Coming soon",
  },

  {
    slug: "partner-program-impact-study",
    title: "Partner Program Impact Study",
    category: "Impact Study",
    description:
      "Kajian yang mendokumentasikan bukti perubahan, hasil, dan pembelajaran lintas program kemitraan.",
    status: "Coming soon",
  },
];

export default function LearningPage() {
  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      {/* Global navigation */}
      <TopNav />

      {/* Header */}
      <header className="border-b border-[#004B5C]/10 bg-[#004B5C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
            Planet Indonesia
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Learning
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Impact studies, evidence, and learning from Planet Indonesia
            partnerships and programs.
          </p>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
            Impact knowledge
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#004B5C]">
            Impact assessment reports
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#004B5C]/65">
            A collection of impact assessment reports and learning
            products developed through Planet Indonesia&apos;s
            partnership work.
          </p>
        </section>

        {/* Report list */}
        <section className="space-y-5">
          {learningReports.map((report) => (
            <article
              key={report.slug}
              className="overflow-hidden rounded-3xl border border-[#004B5C]/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                {report.image && (
                  <div className="w-full shrink-0 md:w-[220px]">
                    <div className="h-full min-h-[190px] overflow-hidden bg-[#D9F0F0]">
                      <img
                        src={report.image}
                        alt={report.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#D9F0F0] px-3 py-1 text-[11px] font-semibold text-[#004B5C]">
                        {report.category}
                      </span>

                      <span
                        className={
                          report.status === "Available"
                            ? "rounded-full bg-[#E4F1E8] px-3 py-1 text-[11px] font-semibold text-[#28613B]"
                            : "rounded-full bg-[#F7F0EC] px-3 py-1 text-[11px] font-semibold text-[#004B5C]/55"
                        }
                      >
                        {report.status}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold text-[#004B5C]">
                      {report.title}
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[#004B5C]/60">
                      {report.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-6">
                    {report.status === "Available" ? (
                      <Link
                        href={`/learning/reports/${report.slug}`}
                        className="inline-flex items-center rounded-full bg-[#004B5C] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#003B48]"
                      >
                        View report

                        <span className="ml-2 text-base leading-none">
                          →
                        </span>
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center rounded-full bg-[#E9E2DE] px-5 py-3 text-xs font-semibold text-[#004B5C]/40">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Note */}
        <section className="mt-8 rounded-2xl border border-[#730A2D]/15 bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
            Note
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#004B5C]/60">
            Learning reports are presented as standalone HTML reports
            and displayed inside this portal when the report files are
            available.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#004B5C]/10">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-2 text-xs text-[#004B5C]/45 sm:flex-row sm:items-center sm:justify-between">
            <p>Planet Indonesia · Learning</p>

            <p>Impact studies and learning</p>
          </div>
        </div>
      </footer>
    </main>
  );
}