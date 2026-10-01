"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";

type DirectoryItem = {
  document_id: string;
  partner: string;
  grant_type: string;
  funder: string;
  document_type: string;
  reporting_period: string;
  year: string | number;
  description: string;
  file_url: string;
};

const PARTNER_ORDER = [
  "AKAR",
  "Tananua",
  "Japesda",
  "JARI",
  "TLGC",
  "KKI",
  "Bantaya",
  "Pionir",
  "Fala Lamo",
  "YCMM",
];

function isReport(item: DirectoryItem) {
  return item.document_type
    ?.toLowerCase()
    .includes("report");
}

function isProposal(item: DirectoryItem) {
  return item.document_type
    ?.toLowerCase()
    .includes("proposal");
}

function isLogframe(item: DirectoryItem) {
  return item.document_type
    ?.toLowerCase()
    .includes("logframe");
}

function formatYear(year: string | number) {
  if (
    year === "" ||
    year === null ||
    year === undefined
  ) {
    return "";
  }

  return String(year);
}

function getPreviewUrl(url: string) {
  if (!url) return "";

  // Google Docs
  const googleDocMatch = url.match(
    /docs\.google\.com\/document\/d\/([^/]+)/
  );

  if (googleDocMatch) {
    return `https://docs.google.com/document/d/${googleDocMatch[1]}/preview`;
  }

  // Google Sheets
  const googleSheetMatch = url.match(
    /docs\.google\.com\/spreadsheets\/d\/([^/]+)/
  );

  if (googleSheetMatch) {
    return `https://docs.google.com/spreadsheets/d/${googleSheetMatch[1]}/preview`;
  }

  // Google Drive file
  const googleDriveFileMatch = url.match(
    /drive\.google\.com\/file\/d\/([^/]+)/
  );

  if (googleDriveFileMatch) {
    return `https://drive.google.com/file/d/${googleDriveFileMatch[1]}/preview`;
  }

  // Looker Studio
  if (
    url.includes("datastudio.google.com") ||
    url.includes("lookerstudio.google.com")
  ) {
    return url;
  }

  return "";
}

export default function DirectoryPage() {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] =
    useState("All");
  const [funderFilter, setFunderFilter] =
    useState("All");
  const [yearFilter, setYearFilter] =
    useState("All");

  const [expandedPartner, setExpandedPartner] =
    useState<string | null>(null);

  const [previewItem, setPreviewItem] =
    useState<DirectoryItem | null>(null);

  // ----------------------------------------
  // LOAD DATA
  // ----------------------------------------

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/directory",
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result?.error ||
              "Gagal mengambil data Directory."
          );
        }

        setItems(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data Directory."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDirectory();
  }, []);

  // ----------------------------------------
  // ESC TO CLOSE MODAL
  // ----------------------------------------

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewItem(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ----------------------------------------
  // FILTER OPTIONS
  // ----------------------------------------

  const partners = useMemo(() => {
    return PARTNER_ORDER.filter((partner) =>
      items.some(
        (item) => item.partner === partner
      )
    );
  }, [items]);

  const funders = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) =>
            item.funder?.trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [items]);

  const years = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) =>
            formatYear(item.year)
          )
          .filter(Boolean)
      )
    ).sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [items]);

  // ----------------------------------------
  // GROUP DATA BY PARTNER
  // ----------------------------------------

  const groupedPartners = useMemo(() => {
    const groups: Record<
      string,
      DirectoryItem[]
    > = {};

    for (const item of items) {
      const partner =
        item.partner || "Other";

      if (!groups[partner]) {
        groups[partner] = [];
      }

      groups[partner].push(item);
    }

    return groups;
  }, [items]);

  // ----------------------------------------
  // FILTERED RESOURCES
  // ----------------------------------------

  const filteredItems = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.partner,
          item.document_id,
          item.document_type,
          item.grant_type,
          item.funder,
          item.reporting_period,
          formatYear(item.year),
          item.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesPartner =
        partnerFilter === "All" ||
        item.partner === partnerFilter;

      const matchesFunder =
        funderFilter === "All" ||
        item.funder === funderFilter;

      const matchesYear =
        yearFilter === "All" ||
        formatYear(item.year) ===
          yearFilter;

      return (
        matchesSearch &&
        matchesPartner &&
        matchesFunder &&
        matchesYear
      );
    });
  }, [
    items,
    search,
    partnerFilter,
    funderFilter,
    yearFilter,
  ]);

  // ----------------------------------------
  // HEADER SUMMARY
  // ----------------------------------------

  const totalPartners = useMemo(() => {
    return Object.keys(groupedPartners).length;
  }, [groupedPartners]);

  const totalProposals = useMemo(() => {
    return items.filter(isProposal).length;
  }, [items]);

  const totalLogframes = useMemo(() => {
    return items.filter(isLogframe).length;
  }, [items]);

  const totalReports = useMemo(() => {
    return items.filter(isReport).length;
  }, [items]);

  // ----------------------------------------
  // FILTER STATE
  // ----------------------------------------

  const hasFilters =
    Boolean(search.trim()) ||
    partnerFilter !== "All" ||
    funderFilter !== "All" ||
    yearFilter !== "All";

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------

  function togglePartner(partner: string) {
    setExpandedPartner((current) =>
      current === partner
        ? null
        : partner
    );
  }

  function clearFilters() {
    setSearch("");
    setPartnerFilter("All");
    setFunderFilter("All");
    setYearFilter("All");
  }

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <main className="min-h-screen bg-[#F7F0EC] text-[#004B5C]">
      <TopNav />

      {/* ==================================================
          HEADER
      ================================================== */}
      <header className="border-b border-[#004B5C]/10 bg-[#004B5C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Planet Indonesia
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Partnership Directory
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Partnership documents, reports, logframes,
            databases, and dashboards.
          </p>

          {/* SUMMARY */}
          <div className="mt-6 flex flex-wrap gap-3">

            {/* PARTNERS */}
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Partners
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {totalPartners}
              </p>
            </div>

            {/* PROPOSALS */}
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Proposals
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {totalProposals}
              </p>
            </div>

            {/* LOGFRAMES */}
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Logframes
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {totalLogframes}
              </p>
            </div>

            {/* REPORTS */}
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Reports
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {totalReports}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          CONTENT
      ================================================== */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">

        {/* ==================================================
            SEARCH + FILTERS
        ================================================== */}
        <div className="mb-6 rounded-3xl border border-[#004B5C]/10 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_0.8fr]">

            {/* SEARCH */}
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search partner or document..."
              className="h-11 w-full rounded-xl border border-[#004B5C]/15 bg-[#F7F0EC]/50 px-4 text-sm outline-none transition focus:border-[#004B5C]/40"
            />

            {/* PARTNER */}
            <select
              value={partnerFilter}
              onChange={(e) =>
                setPartnerFilter(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-[#004B5C]/15 bg-white px-4 text-sm outline-none focus:border-[#004B5C]/40"
            >
              <option value="All">
                All partners
              </option>

              {partners.map((partner) => (
                <option
                  key={partner}
                  value={partner}
                >
                  {partner}
                </option>
              ))}
            </select>

            {/* FUNDER */}
            <select
              value={funderFilter}
              onChange={(e) =>
                setFunderFilter(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-[#004B5C]/15 bg-white px-4 text-sm outline-none focus:border-[#004B5C]/40"
            >
              <option value="All">
                All funders
              </option>

              {funders.map((funder) => (
                <option
                  key={funder}
                  value={funder}
                >
                  {funder}
                </option>
              ))}
            </select>

            {/* YEAR */}
            <select
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-[#004B5C]/15 bg-white px-4 text-sm outline-none focus:border-[#004B5C]/40"
            >
              <option value="All">
                All years
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[#004B5C]/50">
              {hasFilters
                ? `${filteredItems.length} resources found`
                : `${totalPartners} partners in Directory`}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#004B5C] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}
        {loading && (
          <div className="rounded-3xl border border-[#004B5C]/10 bg-white px-6 py-12 text-center text-sm text-[#004B5C]/55 shadow-sm">
            Loading Directory...
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}
        {!loading && error && (
          <div className="rounded-3xl border border-[#730A2D]/20 bg-[#730A2D]/5 px-6 py-6 text-sm text-[#730A2D]">
            {error}
          </div>
        )}

        {/* ==================================================
            FILTER MODE
            FILTER AKTIF → LANGSUNG KE FILE
        ================================================== */}
        {!loading &&
          !error &&
          hasFilters && (
            <>
              {filteredItems.length === 0 ? (
                <div className="rounded-3xl border border-[#004B5C]/10 bg-white px-6 py-12 text-center text-sm text-[#004B5C]/55 shadow-sm">
                  No matching resources found.
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-[#004B5C]/10 bg-white shadow-sm">

                  {/* FILTERED HEADER */}
                  <div className="border-b border-[#004B5C]/10 bg-[#F7F0EC]/50 px-6 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004B5C]/40">
                      Filtered resources
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {filteredItems.length} matching resources
                    </p>
                  </div>

                  {/* FILE LIST */}
                  <div className="divide-y divide-[#004B5C]/8">
                    {filteredItems.map(
                      (item) => {
                        const year =
                          formatYear(
                            item.year
                          );

                        return (
                          <div
                            key={
                              item.document_id
                            }
                            className="px-6 py-5 transition hover:bg-[#F7F0EC]/30"
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                              <div className="min-w-0">
                                <div className="flex flex-wrap gap-2">

                                  <span className="rounded-full bg-[#004B5C]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
                                    {item.document_type ||
                                      "Resource"}
                                  </span>

                                  {item.reporting_period && (
                                    <span className="rounded-full bg-[#FFB432]/20 px-2.5 py-1 text-[10px] font-semibold">
                                      {
                                        item.reporting_period
                                      }
                                    </span>
                                  )}

                                  {year && (
                                    <span className="rounded-full border border-[#004B5C]/10 px-2.5 py-1 text-[10px] font-semibold text-[#004B5C]/60">
                                      {year}
                                    </span>
                                  )}
                                </div>

                                <h2 className="mt-3 text-base font-semibold leading-6">
                                  {item.description ||
                                    "Untitled resource"}
                                </h2>

                                <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#004B5C]/50">

                                  <span className="font-semibold text-[#004B5C]/70">
                                    {item.partner}
                                  </span>

                                  {item.grant_type && (
                                    <>
                                      <span>
                                        ·
                                      </span>

                                      <span>
                                        {
                                          item.grant_type
                                        }
                                      </span>
                                    </>
                                  )}

                                  {item.funder && (
                                    <>
                                      <span>
                                        ·
                                      </span>

                                      <span>
                                        {
                                          item.funder
                                        }
                                      </span>
                                    </>
                                  )}

                                  <span>
                                    ·
                                  </span>

                                  <span>
                                    {
                                      item.document_id
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* REVIEW */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewItem(
                                    item
                                  )
                                }
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#004B5C] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                              >
                                Review ↗
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        {/* ==================================================
            NORMAL MODE
            TANPA FILTER → LIST PER MITRA
        ================================================== */}
        {!loading &&
          !error &&
          !hasFilters && (
            <div className="space-y-3">

              {PARTNER_ORDER.filter(
                (partner) =>
                  groupedPartners[partner]
              ).map((partner) => {

                const allResources =
                  groupedPartners[partner];

                const expanded =
                  expandedPartner ===
                  partner;

                const proposalCount =
                  allResources.filter(
                    isProposal
                  ).length;

                const logframeCount =
                  allResources.filter(
                    isLogframe
                  ).length;

                const reportCount =
                  allResources.filter(
                    isReport
                  ).length;

                const fundersForPartner =
                  Array.from(
                    new Set(
                      allResources
                        .map(
                          (item) =>
                            item.funder
                        )
                        .filter(Boolean)
                    )
                  );

                return (
                  <section
                    key={partner}
                    className="overflow-hidden rounded-3xl border border-[#004B5C]/10 bg-white shadow-sm"
                  >

                    {/* PARTNER HEADER */}
                    <button
                      type="button"
                      onClick={() =>
                        togglePartner(
                          partner
                        )
                      }
                      className="w-full px-6 py-5 text-left transition hover:bg-[#F7F0EC]/40"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* LEFT */}
                        <div className="min-w-0 flex-1">

                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004B5C]/40">
                            Partner
                          </p>

                          <h2 className="mt-1 text-xl font-semibold tracking-tight">
                            {partner}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#004B5C]/50">

                            <span>
                              {
                                allResources.length
                              }{" "}
                              resources
                            </span>

                            <span>
                              ·
                            </span>

                            <span>
                              {fundersForPartner.join(
                                " · "
                              )}
                            </span>

                          </div>
                        </div>

                        {/* COUNTS */}
                        <div className="flex items-center justify-between gap-5 lg:justify-end">

                          <div className="flex items-center gap-5">

                            {/* PROPOSAL */}
                            <div className="min-w-[68px] text-center">
                              <p className="text-2xl font-semibold leading-none">
                                {
                                  proposalCount
                                }
                              </p>

                              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#004B5C]/40">
                                Proposal
                              </p>
                            </div>

                            {/* LOGFRAME */}
                            <div className="min-w-[68px] text-center">
                              <p className="text-2xl font-semibold leading-none">
                                {
                                  logframeCount
                                }
                              </p>

                              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#004B5C]/40">
                                Logframe
                              </p>
                            </div>

                            {/* REPORTS */}
                            <div className="min-w-[68px] text-center">
                              <p className="text-2xl font-semibold leading-none">
                                {
                                  reportCount
                                }
                              </p>

                              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#004B5C]/40">
                                Reports
                              </p>
                            </div>
                          </div>

                          {/* ARROW */}
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#004B5C]/10 bg-[#F7F0EC] text-lg transition ${
                              expanded
                                ? "rotate-180 bg-[#004B5C] text-white"
                                : "text-[#004B5C]"
                            }`}
                          >
                            ↓
                          </span>

                        </div>
                      </div>
                    </button>

                    {/* ==================================================
                        RESOURCE LIST
                    ================================================== */}
                    {expanded && (
                      <div className="border-t border-[#004B5C]/10 bg-[#F7F0EC]/35">

                        <div className="divide-y divide-[#004B5C]/8">

                          {allResources.map(
                            (item) => {

                              const year =
                                formatYear(
                                  item.year
                                );

                              return (
                                <div
                                  key={
                                    item.document_id
                                  }
                                  className="px-6 py-5"
                                >

                                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                    {/* INFO */}
                                    <div className="min-w-0">

                                      <div className="flex flex-wrap gap-2">

                                        <span className="rounded-full bg-[#004B5C]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
                                          {item.document_type ||
                                            "Resource"}
                                        </span>

                                        {item.reporting_period && (
                                          <span className="rounded-full bg-[#FFB432]/20 px-2.5 py-1 text-[10px] font-semibold">
                                            {
                                              item.reporting_period
                                            }
                                          </span>
                                        )}

                                        {year && (
                                          <span className="rounded-full border border-[#004B5C]/10 px-2.5 py-1 text-[10px] font-semibold text-[#004B5C]/60">
                                            {year}
                                          </span>
                                        )}

                                      </div>

                                      <h3 className="mt-3 text-base font-semibold leading-6">
                                        {item.description ||
                                          "Untitled resource"}
                                      </h3>

                                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#004B5C]/45">

                                        {item.grant_type && (
                                          <span>
                                            {
                                              item.grant_type
                                            }
                                          </span>
                                        )}

                                        {item.funder && (
                                          <>
                                            <span>
                                              ·
                                            </span>

                                            <span>
                                              {
                                                item.funder
                                              }
                                            </span>
                                          </>
                                        )}

                                        <span>
                                          ·
                                        </span>

                                        <span>
                                          {
                                            item.document_id
                                          }
                                        </span>

                                      </div>
                                    </div>

                                    {/* REVIEW */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewItem(
                                          item
                                        )
                                      }
                                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#004B5C] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                                    >
                                      Review ↗
                                    </button>

                                  </div>
                                </div>
                              );
                            }
                          )}

                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
      </section>

      {/* ==================================================
          REVIEW MODAL
      ================================================== */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#004B5C]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setPreviewItem(null);
            }
          }}
        >
          <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-5 border-b border-[#004B5C]/10 px-6 py-5">

              <div className="min-w-0">

                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full bg-[#004B5C]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
                    {previewItem.document_type ||
                      "Resource"}
                  </span>

                  {previewItem.reporting_period && (
                    <span className="rounded-full bg-[#FFB432]/20 px-2.5 py-1 text-[10px] font-semibold">
                      {
                        previewItem.reporting_period
                      }
                    </span>
                  )}

                  {formatYear(
                    previewItem.year
                  ) && (
                    <span className="rounded-full border border-[#004B5C]/10 px-2.5 py-1 text-[10px] font-semibold text-[#004B5C]/60">
                      {formatYear(
                        previewItem.year
                      )}
                    </span>
                  )}

                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  {previewItem.description}
                </h2>

                <p className="mt-1 text-xs text-[#004B5C]/50">
                  {previewItem.partner}
                  {" · "}
                  {previewItem.grant_type}
                  {" · "}
                  {previewItem.funder}
                  {" · "}
                  {previewItem.document_id}
                </p>
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={() =>
                  setPreviewItem(null)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#004B5C]/10 bg-[#F7F0EC] text-lg transition hover:bg-[#004B5C] hover:text-white"
                aria-label="Close review"
              >
                ×
              </button>

            </div>

            {/* PREVIEW */}
            <div className="min-h-0 flex-1 bg-[#F7F0EC]">

              {getPreviewUrl(
                previewItem.file_url
              ) ? (
                <iframe
                  src={getPreviewUrl(
                    previewItem.file_url
                  )}
                  title={
                    previewItem.description
                  }
                  className="h-full w-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">

                  <div className="max-w-md">

                    <p className="text-sm font-semibold">
                      Preview unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#004B5C]/55">
                      This resource does not
                      provide an embeddable
                      preview. Open the
                      original resource to
                      review it.
                    </p>

                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col gap-3 border-t border-[#004B5C]/10 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-[#004B5C]/45">
                Preview inside Partnership
                Directory
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setPreviewItem(null)
                  }
                  className="rounded-xl border border-[#004B5C]/15 px-4 py-2.5 text-xs font-semibold"
                >
                  Close
                </button>

                <a
                  href={
                    previewItem.file_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#004B5C] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  Open Original ↗
                </a>

              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}