"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import TopNav from "@/app/components/TopNav";

type ReportConfig = {
  slug: string;
  title: string;
  category: string;
  description: string;
  htmlPath: string;
};

const reports: ReportConfig[] = [
  {
    slug: "ilomata-forest-loss-impact",
    title: "Ilomata Forest Loss Impact",
    category: "Impact Assessment",
    description:
      "Kajian dampak pendampingan terhadap tutupan hutan di Desa Ilomata.",
    htmlPath: "/learning-reports/ilomata-forest-loss-impact.html",
  },

  {
    slug: "mentawai-community-forest",
    title: "Mentawai Community Forest",
    category: "Impact Assessment",
    description:
      "Kajian mengenai hutan komunitas dan tenurial masyarakat Mentawai.",
    htmlPath: "/learning-reports/mentawai-community-forest.html",
  },
];

export default function LearningReportPage() {
  const params = useParams();
  const slug = String(params?.slug || "");

  const report = reports.find((item) => item.slug === slug);

  if (!report) {
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
          <Link
            href="/learning"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "28px",
              padding: "10px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(0,75,92,0.18)",
              background: "#FFFFFF",
              color: "#004B5C",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ← Back to Learning
          </Link>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "48px",
              border: "1px solid rgba(0,75,92,0.10)",
              boxShadow: "0 16px 40px rgba(0,75,92,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "12px",
                color: "#730A2D",
              }}
            >
              Learning report
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight: 1.1,
                fontWeight: 700,
              }}
            >
              Report not found
            </h1>

            <p
              style={{
                marginTop: "16px",
                marginBottom: 0,
                fontSize: "16px",
                lineHeight: 1.7,
                color: "rgba(0,75,92,0.72)",
              }}
            >
              Report dengan slug{" "}
              <strong>{slug || "(empty)"}</strong> tidak ditemukan.
            </p>
          </div>
        </section>
      </main>
    );
  }

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
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "105px 24px 40px",
        }}
      >
        {/* BACK BUTTON */}
        <Link
          href="/learning"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "28px",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(0,75,92,0.18)",
            background: "#FFFFFF",
            color: "#004B5C",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
        >
          ← Back to Learning
        </Link>

        {/* REPORT HEADER */}
        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#730A2D",
              marginBottom: "10px",
            }}
          >
            {report.category}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {report.title}
          </h1>

          <p
            style={{
              marginTop: "16px",
              maxWidth: "760px",
              fontSize: "17px",
              lineHeight: 1.7,
              color: "rgba(0,75,92,0.72)",
            }}
          >
            {report.description}
          </p>
        </div>

        {/* REPORT FRAME */}
        <div
          style={{
            width: "100%",
            background: "#FFFFFF",
            borderRadius: "24px",
            overflow: "hidden",
            border: "1px solid rgba(0,75,92,0.10)",
            boxShadow: "0 18px 50px rgba(0,75,92,0.10)",
          }}
        >
          <iframe
            src={report.htmlPath}
            title={report.title}
            style={{
              display: "block",
              width: "100%",
              height: "calc(100vh - 230px)",
              minHeight: "800px",
              border: "none",
              background: "#FFFFFF",
            }}
          />
        </div>
      </section>
    </main>
  );
}