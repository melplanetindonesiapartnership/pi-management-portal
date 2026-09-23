import Link from "next/link";
import TopNav from "@/app/components/TopNav";

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
      "Kajian mengenai hutan komunitas dan tenurial masyarakat Mentawai.",
    status: "Available",
    image: "/learning-reports/mentawai-cover.png",
  },

  {
    slug: "pi-mel-smart-patrol-2026",
    title: "Publikasi Hasil Pelatihan MEL dan SMART Patrol Mitra YPI 2026",
    category: "Learning Publication",
    description:
      "Publikasi hasil pelatihan MEL dan SMART Patrol Mitra YPI 2026 dalam format web portrait.",
    status: "Available",
    image: "/learning-reports/pi-mel-smart-patrol-2026-cover.jpg",
  },

  {
    slug: "future-impact-assessment",
    title: "Future Impact Assessment",
    category: "Impact Assessment",
    description:
      "Laporan impact assessment lainnya akan tersedia di sini.",
    status: "Coming soon",
  },
];

export default function LearningPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F0EC",
        color: "#004B5C",
      }}
    >
      <TopNav />

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "120px 24px 80px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            maxWidth: "820px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#730A2D",
              marginBottom: "12px",
            }}
          >
            Learning
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(38px, 6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              fontWeight: 700,
            }}
          >
            Knowledge & Impact Reports
          </h1>

          <p
            style={{
              marginTop: "18px",
              marginBottom: 0,
              maxWidth: "760px",
              fontSize: "17px",
              lineHeight: 1.7,
              color: "rgba(0,75,92,0.72)",
            }}
          >
            A library of learning publications, impact assessments, and
            knowledge products from Planet Indonesia and its partnerships.
          </p>
        </div>

        {/* REPORT GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {learningReports.map((report) => {
            const available = report.status === "Available";

            return (
              <article
                key={report.slug}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#FFFFFF",
                  borderRadius: "22px",
                  overflow: "hidden",
                  border: "1px solid rgba(0,75,92,0.10)",
                  boxShadow: "0 14px 40px rgba(0,75,92,0.07)",
                  minHeight: "100%",
                }}
              >
                {/* THUMBNAIL */}
                {report.image ? (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      overflow: "hidden",
                      background: "#EAE2DD",
                    }}
                  >
                    <img
                      src={report.image}
                      alt={report.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      background:
                        "linear-gradient(135deg, #004B5C, #730A2D)",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "24px",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    Learning report
                  </div>
                )}

                {/* CONTENT */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#730A2D",
                      }}
                    >
                      {report.category}
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        padding: "5px 9px",
                        borderRadius: "999px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: available
                          ? "rgba(0,75,92,0.08)"
                          : "rgba(115,10,45,0.08)",
                        color: available ? "#004B5C" : "#730A2D",
                      }}
                    >
                      {report.status}
                    </div>
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "24px",
                      lineHeight: 1.15,
                      letterSpacing: "-0.025em",
                      color: "#004B5C",
                    }}
                  >
                    {report.title}
                  </h2>

                  <p
                    style={{
                      marginTop: "14px",
                      marginBottom: "24px",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "rgba(0,75,92,0.68)",
                    }}
                  >
                    {report.description}
                  </p>

                  <div style={{ marginTop: "auto" }}>
                    {available ? (
                      <Link
                        href={`/learning/reports/${report.slug}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "11px 16px",
                          borderRadius: "999px",
                          background: "#004B5C",
                          color: "#FFFFFF",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        View report →
                      </Link>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "11px 16px",
                          borderRadius: "999px",
                          background: "rgba(0,75,92,0.06)",
                          color: "rgba(0,75,92,0.42)",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}