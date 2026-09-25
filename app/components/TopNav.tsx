"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type Section =
  | "overview"
  | "sprints"
  | "monitoring"
  | "publications"
  | "portal-review";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<Section>("overview");

  const navRef =
    useRef<HTMLElement | null>(null);

  const overviewRef =
    useRef<HTMLButtonElement | null>(null);

  const sprintsRef =
    useRef<HTMLButtonElement | null>(null);

  const monitoringRef =
    useRef<HTMLButtonElement | null>(null);

  const publicationsRef =
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

    if (section === "overview") {
      target = overviewRef.current;
    }

    if (section === "sprints") {
      target = sprintsRef.current;
    }

    if (section === "monitoring") {
      target = monitoringRef.current;
    }

    if (section === "publications") {
      target = publicationsRef.current;
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
   */
  useEffect(() => {
    if (
      pathname === "/publications" ||
      pathname.startsWith("/publications/")
    ) {
      setActiveSection("publications");
      return;
    }

    if (pathname === "/monitoring") {
      setActiveSection("monitoring");
      return;
    }

    if (pathname === "/partner-review") {
      setActiveSection("portal-review");
      return;
    }

    /*
     * Only homepage can switch between Overview and Sprints
     * based on scroll position.
     */
    if (pathname === "/") {
      const activeWork =
        document.getElementById("active-work");

      if (!activeWork) {
        setActiveSection("overview");
        return;
      }

      const activeWorkTop =
        activeWork.getBoundingClientRect().top +
        window.scrollY;

      const trigger =
        activeWorkTop - 115;

      if (window.scrollY >= trigger) {
        setActiveSection("sprints");
      } else {
        setActiveSection("overview");
      }

      return;
    }

    setActiveSection("overview");
  }, [pathname]);

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
   * Homepage scroll behavior.
   */
  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    let ticking = false;

    function updateActiveSection() {
      const activeWork =
        document.getElementById("active-work");

      if (!activeWork) {
        ticking = false;
        return;
      }

      const activeWorkTop =
        activeWork.getBoundingClientRect().top +
        window.scrollY;

      const trigger =
        activeWorkTop - 115;

      const nextSection: Section =
        window.scrollY >= trigger
          ? "sprints"
          : "overview";

      setActiveSection(nextSection);

      ticking = false;
    }

    function handleScroll() {
      if (ticking) {
        return;
      }

      ticking = true;

      window.requestAnimationFrame(
        updateActiveSection
      );
    }

    updateActiveSection();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [pathname]);

  /*
   * Overview
   */
  function goToOverview() {
    setActiveSection("overview");

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
   * Sprints
   */
  function goToSprints() {
    setActiveSection("sprints");

    if (pathname === "/") {
      const activeWork =
        document.getElementById("active-work");

      if (!activeWork) {
        return;
      }

      const target =
        activeWork.getBoundingClientRect().top +
        window.scrollY -
        100;

      window.scrollTo({
        top: Math.max(target, 0),
        behavior: "smooth",
      });

      return;
    }

    router.push("/");

    setTimeout(() => {
      const activeWork =
        document.getElementById("active-work");

      if (!activeWork) {
        return;
      }

      const target =
        activeWork.getBoundingClientRect().top +
        window.scrollY -
        100;

      window.scrollTo({
        top: Math.max(target, 0),
        behavior: "smooth",
      });
    }, 300);
  }

  /*
   * Monitoring
   */
  function goToMonitoring() {
    setActiveSection("monitoring");
    router.push("/monitoring");
  }

  /*
   * Publications
   */
  function goToPublications() {
    setActiveSection("publications");
    router.push("/publications");
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
        <div className="hidden shrink-0 md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            Planet Indonesia
          </p>

          <p className="mt-0.5 text-xs text-white/45">
            Management Portal
          </p>
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

          {/* Overview */}
          <button
            ref={overviewRef}
            type="button"
            onClick={goToOverview}
            className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeSection === "overview"
                ? "text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Overview
          </button>

          {/* Sprints */}
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
          <span className="relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold text-white/30">
            Partners
          </span>

          {/* Performance */}
          <span className="relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold text-white/30">
            Performance
          </span>

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