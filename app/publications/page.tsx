"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TopNav from "@/app/components/TopNav";

type PublicationSource = "YPI" | "Partners";

type Publication = {
  id: number;
  title: string;
  source: PublicationSource;
  partner: string;
  year: number;
  category: string;
  topic: string;
  description: string;
  url: string;
  detailUrl?: string;
  local?: boolean;
  featured?: boolean;
  image?: string;
};

const publications: Publication[] = [
  {
    id: 1,
    title:
      "Publikasi Hasil Pelatihan MEL dan SMART Patrol Mitra YPI 2026",
    source: "YPI",
    partner: "",
    year: 2026,
    category: "Learning Publication",
    topic: "MEL & SMART Patrol",
    description:
      "Publikasi hasil pelatihan Monitoring, Evaluation and Learning (MEL) dan SMART Patrol bersama mitra YPI tahun 2026.",
    url:
      "/learning/reports/pi-mel-smart-patrol-2026",
    local: true,
    featured: true,
    image:
      "/learning-reports/pi-mel-smart-patrol-2026-cover.jpg",
  },

  {
    id: 2,
    title: "Ilomata Forest Loss Impact",
    source: "YPI",
    partner: "",
    year: 2026,
    category: "Impact Assessment",
    topic: "Forest Conservation",
    description:
      "Publication documenting forest loss and conservation-related findings from the Ilomata assessment.",
    url:
      "/learning/reports/ilomata-forest-loss-impact",
    local: true,
    featured: true,
    image:
      "/learning-reports/ilomata-cover.jpg",
  },

  {
    id: 3,
    title: "Mentawai Community Forest",
    source: "YPI",
    partner: "",
    year: 2026,
    category: "Impact Assessment",
    topic: "Community Forestry",
    description:
      "Knowledge publication on community forest management and related learning in Mentawai.",
    url:
      "/learning/reports/mentawai-community-forest",
    local: true,
    image:
      "/learning-reports/mentawai-cover.png",
  },

  {
    id: 4,
    title:
      "Dari Desa untuk Bumi: Spiritualitas Ekologis dan Gerakan Konservasi Berbasis Komunitas di Flores",
    source: "Partners",
    partner: "Tananua Flores",
    year: 2025,
    category: "Journal / Article",
    topic: "Community Conservation",
    description:
      "Publikasi Tananua Flores mengenai gerakan konservasi berbasis komunitas di Flores.",
    url:
      "https://www.tananua.org/dari-desa-untuk-bumi-spiritualitas-ekologis-dan-gerakan-konservasi-berbasis-komunitas-di-flores-2/",
    detailUrl:
      "/publications/tananua-desa-untuk-bumi",
    image:
      "/learning-reports/tananua-desa-untuk-bumi.jpg",
  },
];

const categories = [
  "All Categories",
  "Research Report",
  "Impact Assessment",
  "Policy Brief",
  "Learning Publication",
  "Case Study",
  "Annual Report",
  "Journal / Article",
  "Publication",
];

const topics = [
  "All Topics",
  "Forest Conservation",
  "Community Forestry",
  "Community Governance",
  "Community Conservation",
  "Marine & Fisheries",
  "Climate",
  "Livelihoods",
  "MEL & SMART Patrol",
  "Mangrove",
  "Rights & Access",
  "Gender & Inclusion",
];

const years = [
  "All Years",
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
];

export default function PublicationsPage() {
  const [source, setSource] = useState<
    "All" | PublicationSource
  >("All");

  const [partner, setPartner] =
    useState("All Partners");

  const [category, setCategory] =
    useState("All Categories");

  const [topic, setTopic] =
    useState("All Topics");

  const [year, setYear] =
    useState("All Years");

  const [search, setSearch] =
    useState("");

  const partners = useMemo(() => {
    const partnerNames = publications
      .map((publication) => publication.partner)
      .filter(Boolean);

    return [
      "All Partners",
      ...Array.from(new Set(partnerNames)),
    ];
  }, []);

  const filteredPublications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return publications.filter((publication) => {
      const matchesSource =
        source === "All" ||
        publication.source === source;

      const matchesPartner =
        partner === "All Partners" ||
        publication.partner === partner;

      const matchesCategory =
        category === "All Categories" ||
        publication.category === category;

      const matchesTopic =
        topic === "All Topics" ||
        publication.topic === topic;

      const matchesYear =
        year === "All Years" ||
        String(publication.year) === year;

      const matchesSearch =
        !query ||
        publication.title
          .toLowerCase()
          .includes(query) ||
        publication.description
          .toLowerCase()
          .includes(query) ||
        publication.topic
          .toLowerCase()
          .includes(query) ||
        publication.partner
          .toLowerCase()
          .includes(query);

      return (
        matchesSource &&
        matchesPartner &&
        matchesCategory &&
        matchesTopic &&
        matchesYear &&
        matchesSearch
      );
    });
  }, [
    source,
    partner,
    category,
    topic,
    year,
    search,
  ]);

  const featuredPublications =
    filteredPublications.filter(
      (publication) => publication.featured
    );

  function resetFilters() {
    setSource("All");
    setPartner("All Partners");
    setCategory("All Categories");
    setTopic("All Topics");
    setYear("All Years");
    setSearch("");
  }

  const hasActiveFilters =
    source !== "All" ||
    partner !== "All Partners" ||
    category !== "All Categories" ||
    topic !== "All Topics" ||
    year !== "All Years" ||
    search.trim() !== "";

  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#730A2D]">
            Knowledge Library
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Publications
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60 md:text-base">
            Knowledge & publications from YPI and our partners.
          </p>
        </section>

        {/* ===================================================== */}
        {/* SOURCE */}
        {/* ===================================================== */}

        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
            Source
          </p>

          <div className="flex flex-wrap gap-2">
            {(
              ["All", "YPI", "Partners"] as const
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSource(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  source === item
                    ? "bg-[#004B5C] text-white"
                    : "border border-[#004B5C]/10 bg-white text-[#004B5C]/65 hover:text-[#004B5C]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ===================================================== */}
        {/* SEARCH */}
        {/* ===================================================== */}

        <section className="mt-6">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search publications..."
            className="w-full rounded-2xl border border-[#004B5C]/10 bg-white px-5 py-3.5 text-sm text-[#004B5C] outline-none transition placeholder:text-black/35 focus:border-[#004B5C]/30 focus:ring-2 focus:ring-[#004B5C]/10"
          />
        </section>

        {/* ===================================================== */}
        {/* FILTERS */}
        {/* ===================================================== */}

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {/* Partner */}
          <select
            value={partner}
            onChange={(event) =>
              setPartner(event.target.value)
            }
            className="rounded-xl border border-[#004B5C]/10 bg-white px-4 py-3 text-sm text-[#004B5C] outline-none"
          >
            {partners.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="rounded-xl border border-[#004B5C]/10 bg-white px-4 py-3 text-sm text-[#004B5C] outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={(event) =>
              setYear(event.target.value)
            }
            className="rounded-xl border border-[#004B5C]/10 bg-white px-4 py-3 text-sm text-[#004B5C] outline-none"
          >
            {years.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          {/* Topic */}
          <select
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value)
            }
            className="rounded-xl border border-[#004B5C]/10 bg-white px-4 py-3 text-sm text-[#004B5C] outline-none"
          >
            {topics.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </section>

        {/* ===================================================== */}
        {/* RESULT SUMMARY */}
        {/* ===================================================== */}

        <section className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-black/55">
            Showing{" "}
            <span className="font-semibold text-[#004B5C]">
              {filteredPublications.length}
            </span>{" "}
            publications
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-[#730A2D] hover:underline"
            >
              Clear filters
            </button>
          )}
        </section>

        {/* ===================================================== */}
        {/* FEATURED */}
        {/* ===================================================== */}

        {featuredPublications.length > 0 && (
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
                Featured
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Featured Publications
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {featuredPublications.map(
                (publication) => (
                  <PublicationCard
                    key={publication.id}
                    publication={publication}
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* ===================================================== */}
        {/* LATEST */}
        {/* ===================================================== */}

        <section className="mt-10 pb-16">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
              Library
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Latest Publications
            </h2>
          </div>

          {filteredPublications.length === 0 ? (
            <div className="rounded-2xl border border-[#004B5C]/10 bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#004B5C]">
                No publications found.
              </p>

              <p className="mt-2 text-sm text-black/50">
                Try changing the search or filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPublications.map(
                (publication) => (
                  <PublicationListItem
                    key={publication.id}
                    publication={publication}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ============================================================= */
/* FEATURED CARD                                                  */
/* ============================================================= */

function PublicationCard({
  publication,
}: {
  publication: Publication;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white shadow-sm">
      {publication.image ? (
        <div className="aspect-[16/8] overflow-hidden bg-[#004B5C]/5">
          <img
            src={publication.image}
            alt={publication.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/8] items-center justify-center bg-[#004B5C]/5 text-sm font-semibold text-[#004B5C]/40">
          Publication
        </div>
      )}

      <div className="p-5">
        <SourceBadge publication={publication} />

        <h3 className="mt-3 text-xl font-semibold leading-7 text-[#004B5C]">
          {publication.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-black/55">
          {publication.description}
        </p>

        <PublicationMeta publication={publication} />

        <PublicationLink publication={publication} />
      </div>
    </article>
  );
}

/* ============================================================= */
/* LIST ITEM                                                       */
/* ============================================================= */

function PublicationListItem({
  publication,
}: {
  publication: Publication;
}) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm md:flex-row md:items-center">
      <div className="hidden h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-[#004B5C]/5 md:block">
        {publication.image ? (
          <img
            src={publication.image}
            alt={publication.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-[#004B5C]/35">
            Publication
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <SourceBadge publication={publication} />

        <h3 className="mt-2 text-lg font-semibold text-[#004B5C]">
          {publication.title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-black/55">
          {publication.description}
        </p>

        <PublicationMeta publication={publication} />
      </div>

      <PublicationLink publication={publication} />
    </article>
  );
}

/* ============================================================= */
/* SOURCE BADGE                                                    */
/* ============================================================= */

function SourceBadge({
  publication,
}: {
  publication: Publication;
}) {
  const label =
    publication.source === "YPI"
      ? "YPI"
      : publication.partner || "Partner";

  return (
    <span className="inline-flex rounded-full bg-[#004B5C]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#004B5C]">
      {label}
    </span>
  );
}

/* ============================================================= */
/* META                                                             */
/* ============================================================= */

function PublicationMeta({
  publication,
}: {
  publication: Publication;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-black/45">
      <span>{publication.category}</span>

      <span>·</span>

      <span>{publication.year}</span>

      <span>·</span>

      <span>{publication.topic}</span>
    </div>
  );
}

/* ============================================================= */
/* PUBLICATION LINK                                                */
/* ============================================================= */

function PublicationLink({
  publication,
}: {
  publication: Publication;
}) {
  /*
   * YPI publication:
   * stay inside the PI portal.
   */
  if (publication.source === "YPI") {
    return (
      <a
        href={publication.url}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#004B5C] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#003D4A]"
      >
        View Publication
      </a>
    );
  }

  /*
   * Partner publication:
   * open internal PI publication detail page first.
   */
  return (
    <Link
      href={publication.detailUrl || publication.url}
      className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#004B5C] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#003D4A]"
    >
      View Publication
    </Link>
  );
}