"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { EVENT_OPERATIONS_URL } from "../lib/links";

type Section =
  | "sprints"
  | "monitoring"
  | "partners"
  | "performance"
  | "publications"
  | "directory"
  | "event-operations"
  | "portal-review";

function sectionForPath(pathname: string): Section {
  if (
    pathname === "/publications" ||
    pathname.startsWith("/publications/")
  ) {
    return "publications";
  }

  if (pathname === "/directory") {
    return "directory";
  }

  if (pathname === "/partners") {
    return "partners";
  }

  if (
    pathname === "/performance" ||
    pathname.startsWith("/performance/")
  ) {
    return "performance";
  }

  // Hub Monitoring dan semua tool di bawahnya (Smart Patrol, Peta Mitra Pesisir, Data Source MEL).
  if (
    pathname === "/monitoring" ||
    pathname.startsWith("/monitoring/")
  ) {
    return "monitoring";
  }

  if (pathname === "/event-operations") {
    return "event-operations";
  }

  if (
    pathname === "/partner-review" ||
    pathname.startsWith("/partner-review/")
  ) {
    return "portal-review";
  }

  return "sprints";
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<Section>(() => sectionForPath(pathname));

  const navRef =
    useRef<HTMLElement | null>(null);

  const sprintsRef =
    useRef<HTMLButtonElement | null>(null);

  const monitoringRef =
    useRef<HTMLButtonElement | null>(null);

  const partnersRef =
    useRef<HTMLButtonElement | null>(null);

  const performanceRef =
    useRef<HTMLButtonElement | null>(null);

  const publicationsRef =
    useRef<HTMLButtonElement | null>(null);

  const directoryRef =
    useRef<HTMLButtonElement | null>(null);

  const eventOperationsRef =
    useRef<HTMLButtonElement | null>(null);

  const portalReviewRef =
    useRef<HTMLButtonElement | null>(null);

  const pillRef =
    useRef<HTMLSpanElement | null>(null);

  function movePill(section: Section) {
    const nav = navRef.current;
    const pill = pillRef.current;

    if (!nav || !pill) {
      return;
    }

    let target: HTMLButtonElement | null = null;

    if (section === "sprints") {
      target = sprintsRef.current;
    }

    if (section === "monitoring") {
      target = monitoringRef.current;
    }

    if (section === "partners") {
      target = partnersRef.current;
    }

    if (section === "performance") {
      target = performanceRef.current;
    }

    if (section === "publications") {
      target = publicationsRef.current;
    }

    if (section === "directory") {
      target = directoryRef.current;
    }

    if (section === "event-operations") {
      target = eventOperationsRef.current;
    }

    if (section === "portal-review") {
      target = portalReviewRef.current;
    }

    if (!target) {
      return;
    }

    const navRect =
      nav.getBoundingClientRect();

    const targetRect =
      target.getBoundingClientRect();

    const left =
      targetRect.left - navRect.left;

    pill.style.width =
      `${targetRect.width}px`;

    pill.style.transform =
      `translateX(${left}px)`;
  }

  /*
   * Determine active section from current URL.
   * Derived during render (not in an effect) to avoid cascading renders.
   */
  const [prevPathname, setPrevPathname] =
    useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActiveSection(sectionForPath(pathname));
  }

  /*
   * Move pill whenever active section changes.
   */
  useLayoutEffect(() => {
    movePill(activeSection);
  }, [activeSection]);

  /*
   * Recalculate pill position on resize.
   */
  useEffect(() => {
    function handleResize() {
      movePill(activeSection);
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [activeSection]);

  /*
   * Sprints (beranda)
   */
  function goToSprints() {
    setActiveSection("sprints");

    if (pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    router.push("/");
  }

  /*
   * Monitoring
   */
  function goToMonitoring() {
    setActiveSection("monitoring");
    router.push("/monitoring");
  }

  /*
   * Partners
   */
  function goToPartners() {
    setActiveSection("partners");
    router.push("/partners");
  }

  /*
   * Performance (satu tool untuk saat ini: Value for Money Mitra YPI)
   */
  function goToPerformance() {
    setActiveSection("performance");
    router.push("/performance/value-for-money");
  }

  /*
   * Publications
   */
  function goToPublications() {
    setActiveSection("publications");
    router.push("/publications");
  }

  /*
   * Directory
   */
  function goToDirectory() {
    setActiveSection("directory");
    router.push("/directory");
  }

  /*
   * Event Operations
   */
  function goToEventOperations() {
    // External Apps Script: open in a new tab, keep the current page and active section.
    window.open(EVENT_OPERATIONS_URL, "_blank", "noopener,noreferrer");
  }

  /*
   * Portal Review
   */
  function goToPortalReview() {
    setActiveSection("portal-review");
    router.push("/partner-review");
  }

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#004B5C]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">

        {/* Brand */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Image
            src="/pi-logo-white.png"
            alt="Yayasan Planet Indonesia"
            width={44}
            height={44}
            priority
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Planet Indonesia
            </p>

            <p className="mt-0.5 text-xs text-white/45">
              Management Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav
          ref={navRef}
          className="relative flex max-w-full items-center overflow-x-auto rounded-full bg-white/10 p-1"
        >
          {/* Sliding pill */}
          <span
            ref={pillRef}
            className="absolute bottom-1 left-0 top-1 rounded-full bg-[#2F8FA6] shadow-sm transition-all duration-300 ease-out"
          />

          {/* Sprints (beranda; dulu Overview + Sprints) */}
          <button
            ref={sprintsRef}
            type="button"
            onClick={goToSprints}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "sprints"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sprints
          </button>

          {/* Monitoring */}
          <button
            ref={monitoringRef}
            type="button"
            onClick={goToMonitoring}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "monitoring"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Monitoring
          </button>

          {/* Programs */}
          <span className="relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold text-white/30">
            Programs
          </span>

          {/* Partners */}
          <button
            ref={partnersRef}
            type="button"
            onClick={goToPartners}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "partners"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Partners
          </button>

          {/* Performance */}
          <button
            ref={performanceRef}
            type="button"
            onClick={goToPerformance}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "performance"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Performance
          </button>

          {/* Publications */}
          <button
            ref={publicationsRef}
            type="button"
            onClick={goToPublications}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "publications"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Publications
          </button>

          {/* Directory */}
          <button
            ref={directoryRef}
            type="button"
            onClick={goToDirectory}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "directory"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Directory
          </button>

          {/* Event Operations */}
          <button
            ref={eventOperationsRef}
            type="button"
            onClick={goToEventOperations}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "event-operations"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Event Operations ↗
          </button>

          {/* Portal Review */}
          <button
            ref={portalReviewRef}
            type="button"
            onClick={goToPortalReview}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "portal-review"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Portal Review
          </button>
        </nav>

        {/* Source */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">
            Source
          </p>

          <p className="mt-0.5 text-xs font-medium text-white/70">
            Notion
          </p>
        </div>
      </div>
    </div>
  );
}