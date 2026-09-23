"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import TopNav from "./components/TopNav";

type Task = {
  id: string;
  name: string;
  description: string;
  assignedTo: string[];
  status: string;
  progress: number | null;
  priority: string | null;
  sprint: string | null;
  startDate: string | null;
  dueDate: string | null;
  subtaskCount: number;
  lastEdited: string;
};

type Subtask = {
  id: string;
  name: string;
  assignedTo: string[];
  done: boolean;
  dueDate: string | null;
  notes: string;
  lastEdited: string;
};

type SubtaskResponse = {
  success: boolean;
  taskId: string;
  count: number;
  completedCount: number;
  remainingCount: number;
  subtasks: Subtask[];
};

const statusTone: Record<string, string> = {
  "Not started":
    "bg-black/5 text-black/65",

  "In progress":
    "bg-[#D9F0F0] text-[#004B5C]",

  QA:
    "bg-[#FFF1C9] text-[#8A5A00]",

  Done:
    "bg-[#E4F1E8] text-[#28613B]",

  Cancelled:
    "bg-black/5 text-black/40",
};

const priorityTone: Record<string, string> = {
  Critical:
    "bg-[#F7DDE4] text-[#730A2D]",

  "High Priority":
    "bg-[#FCEBC8] text-[#8A5A00]",

  Medium:
    "bg-[#EAF0F2] text-[#004B5C]",

  "Medium Priority":
    "bg-[#EAF0F2] text-[#004B5C]",

  Low:
    "bg-black/5 text-black/55",

  "Low Priority":
    "bg-black/5 text-black/55",
};

function formatDate(
  dateString: string | null
) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatLastEdited(
  dateString: string | null
) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function normalizedProgress(
  progress: number | null
) {
  if (
    progress === null ||
    Number.isNaN(progress)
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.min(progress, 100)
  );
}

function progressLabel(
  progress: number | null
) {
  const normalized =
    normalizedProgress(progress);

  if (normalized === null) {
    return "—";
  }

  if (Number.isInteger(normalized)) {
    return `${normalized}%`;
  }

  return `${normalized.toFixed(1)}%`;
}

function isValidDate(
  dateString: string | null
) {
  if (!dateString) {
    return false;
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return !Number.isNaN(
    date.getTime()
  );
}

function dateValue(
  dateString: string
) {
  return new Date(
    `${dateString}T00:00:00`
  ).getTime();
}

function startHasPassed(
  startDate: string | null
) {
  if (!isValidDate(startDate)) {
    return false;
  }

  const now = new Date();

  const start = new Date(
    `${startDate}T00:00:00`
  );

  return (
    start.getTime() <=
    now.getTime()
  );
}

function isOverdue(
  task: Task
) {
  if (!isValidDate(task.dueDate)) {
    return false;
  }

  if (
    task.status === "Done" ||
    task.status === "Cancelled"
  ) {
    return false;
  }

  const now = new Date();

  const due = new Date(
    `${task.dueDate}T23:59:59`
  );

  return (
    due.getTime() <
    now.getTime()
  );
}

function isDueWithinDays(
  task: Task,
  days: number
) {
  if (!isValidDate(task.dueDate)) {
    return false;
  }

  if (
    task.status === "Done" ||
    task.status === "Cancelled"
  ) {
    return false;
  }

  const now = new Date();

  const due = new Date(
    `${task.dueDate}T23:59:59`
  );

  const diff =
    (due.getTime() -
      now.getTime()) /
    (1000 * 60 * 60 * 24);

  return (
    diff >= 0 &&
    diff <= days
  );
}

function isCriticalWithoutProgress(
  task: Task
) {
  const progress =
    normalizedProgress(
      task.progress
    );

  return (
    task.priority === "Critical" &&
    progress !== null &&
    progress === 0 &&
    startHasPassed(
      task.startDate
    ) &&
    task.status !== "Done" &&
    task.status !== "Cancelled"
  );
}

function isUnassigned(
  task: Task
) {
  return (
    task.assignedTo.length === 0 &&
    task.status !== "Done" &&
    task.status !== "Cancelled"
  );
}

function attentionReason(
  task: Task
) {
  if (isOverdue(task)) {
    return "overdue";
  }

  if (
    isCriticalWithoutProgress(
      task
    )
  ) {
    return "critical-no-progress";
  }

  if (
    isDueWithinDays(
      task,
      7
    )
  ) {
    return "due-soon";
  }

  if (isUnassigned(task)) {
    return "unassigned";
  }

  return null;
}

function addDays(
  date: Date,
  days: number
) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

function startOfMonth(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function addMonths(
  date: Date,
  months: number
) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + months,
    1
  );
}

function monthLabel(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default function Home() {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastSynced, setLastSynced] =
    useState<Date | null>(null);

  /* Search / Filters */
  const [searchQuery, setSearchQuery] =
    useState("");

  const [picFilter, setPicFilter] =
    useState("All PIC");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All Status");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("All Priority");

  /*
   * Active Sprint
   */
  const activeWork = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.sprint ===
          "Active Sprint" &&
        task.status !==
          "Cancelled"
    );
  }, [tasks]);

  /*
   * Next Sprint
   */
  const nextSprint = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.sprint ===
          "Next Sprint" &&
        task.status !==
          "Cancelled"
    );
  }, [tasks]);

  /*
   * Tasks without sprint
   */
  const outsideSprint =
    useMemo(() => {
      return tasks.filter(
        (task) =>
          (!task.sprint ||
            task.sprint === "") &&
          task.status !==
            "Cancelled"
      );
    }, [tasks]);

  /*
   * Completed
   */
  const completedActiveTasks =
    useMemo(() => {
      return activeWork.filter(
        (task) =>
          task.status ===
          "Done"
      );
    }, [activeWork]);

  /*
   * Attention
   */
  const attentionItems =
    useMemo(() => {
      return activeWork.filter(
        (task) =>
          attentionReason(
            task
          ) !== null
      );
    }, [activeWork]);

  /*
   * Progress
   */
  const trackedProgress =
    useMemo(() => {
      const values =
        activeWork
          .map((task) =>
            normalizedProgress(
              task.progress
            )
          )
          .filter(
            (
              value
            ): value is number =>
              value !== null
          );

      if (
        values.length === 0
      ) {
        return null;
      }

      const total =
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        );

      return (
        total /
        values.length
      );
    }, [activeWork]);

  /*
   * Filter options
   */
  const picOptions =
    useMemo(() => {
      const values =
        new Set<string>();

      activeWork.forEach(
        (task) => {
          task.assignedTo.forEach(
            (person) => {
              if (person) {
                values.add(
                  person
                );
              }
            }
          );
        }
      );

      return Array.from(
        values
      ).sort((a, b) =>
        a.localeCompare(b)
      );
    }, [activeWork]);

  const statusOptions =
    useMemo(() => {
      const values =
        new Set<string>();

      activeWork.forEach(
        (task) => {
          if (task.status) {
            values.add(
              task.status
            );
          }
        }
      );

      return Array.from(
        values
      ).sort((a, b) =>
        a.localeCompare(b)
      );
    }, [activeWork]);

  const priorityOptions =
    useMemo(() => {
      const values =
        new Set<string>();

      activeWork.forEach(
        (task) => {
          if (task.priority) {
            values.add(
              task.priority
            );
          }
        }
      );

      return Array.from(
        values
      ).sort((a, b) =>
        a.localeCompare(b)
      );
    }, [activeWork]);

  /*
   * Search + filters
   */
  const filteredActiveWork =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return activeWork.filter(
        (task) => {
          const searchableText =
            [
              task.name,
              task.description,
              ...task.assignedTo,
              task.status,
              task.priority ??
                "",
              task.sprint ??
                "",
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            query.length === 0 ||
            searchableText.includes(
              query
            );

          const matchesPic =
            picFilter ===
              "All PIC" ||
            task.assignedTo.includes(
              picFilter
            );

          const matchesStatus =
            statusFilter ===
              "All Status" ||
            task.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter ===
              "All Priority" ||
            task.priority ===
              priorityFilter;

          return (
            matchesSearch &&
            matchesPic &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    }, [
      activeWork,
      searchQuery,
      picFilter,
      statusFilter,
      priorityFilter,
    ]);

  /*
   * Timeline tasks
   * Uses filtered Active Work.
   */
  const timelineTasks =
    useMemo(() => {
      return filteredActiveWork.filter(
        (task) =>
          isValidDate(
            task.startDate
          ) &&
          isValidDate(
            task.dueDate
          )
      );
    }, [filteredActiveWork]);

  /*
   * Timeline tasks without complete dates
   */
  const timelineTasksWithoutDates =
    useMemo(() => {
      return filteredActiveWork.filter(
        (task) =>
          !isValidDate(
            task.startDate
          ) ||
          !isValidDate(
            task.dueDate
          )
      );
    }, [filteredActiveWork]);

  /*
   * Calculate timeline range
   */
  const timelineRange =
    useMemo(() => {
      if (
        timelineTasks.length ===
        0
      ) {
        return null;
      }

      const starts =
        timelineTasks.map(
          (task) =>
            dateValue(
              task.startDate!
            )
        );

      const ends =
        timelineTasks.map(
          (task) =>
            dateValue(
              task.dueDate!
            )
        );

      const minStart =
        new Date(
          Math.min(
            ...starts
          )
        );

      const maxEnd =
        new Date(
          Math.max(
            ...ends
          )
        );

      const start =
        addDays(
          minStart,
          -7
        );

      const end =
        addDays(
          maxEnd,
          7
        );

      return {
        start,
        end,
        startMs:
          start.getTime(),
        endMs:
          end.getTime(),
        totalMs:
          end.getTime() -
          start.getTime(),
      };
    }, [timelineTasks]);

  /*
   * Timeline month segments
   */
  const timelineMonths =
    useMemo(() => {
      if (
        !timelineRange
      ) {
        return [];
      }

      const months: {
        start: Date;
        end: Date;
        label: string;
        left: number;
        width: number;
      }[] = [];

      let cursor =
        startOfMonth(
          timelineRange.start
        );

      while (
        cursor.getTime() <=
        timelineRange.end.getTime()
      ) {
        const nextMonth =
          addMonths(
            cursor,
            1
          );

        const segmentStart =
          new Date(
            Math.max(
              cursor.getTime(),
              timelineRange.startMs
            )
          );

        const segmentEnd =
          new Date(
            Math.min(
              nextMonth.getTime(),
              timelineRange.endMs
            )
          );

        if (
          segmentEnd.getTime() >
          segmentStart.getTime()
        ) {
          const left =
            ((segmentStart.getTime() -
              timelineRange.startMs) /
              timelineRange.totalMs) *
            100;

          const width =
            ((segmentEnd.getTime() -
              segmentStart.getTime()) /
              timelineRange.totalMs) *
            100;

          months.push({
            start:
              segmentStart,
            end: segmentEnd,
            label:
              monthLabel(
                cursor
              ),
            left,
            width,
          });
        }

        cursor =
          nextMonth;
      }

      return months;
    }, [timelineRange]);

  /*
   * Today position
   */
  const todayPosition =
    useMemo(() => {
      if (!timelineRange) {
        return null;
      }

      const now =
        new Date();

      if (
        now.getTime() <
          timelineRange.startMs ||
        now.getTime() >
          timelineRange.endMs
      ) {
        return null;
      }

      return (
        ((now.getTime() -
          timelineRange.startMs) /
          timelineRange.totalMs) *
        100
      );
    }, [timelineRange]);

  /*
   * Load Notion Tasks
   */
  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/notion/tasks",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load Notion tasks (${response.status})`
          );
        }

        const data =
          await response.json();

        if (
          !data?.success ||
          !Array.isArray(
            data?.tasks
          )
        ) {
          throw new Error(
            data?.error ||
              "Invalid response from Notion API"
          );
        }

        if (!mounted) {
          return;
        }

        setTasks(
          data.tasks
        );

        setLastSynced(
          new Date()
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load Notion tasks.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      mounted = false;
    };
  }, []);

  function clearFilters() {
    setSearchQuery("");
    setPicFilter(
      "All PIC"
    );
    setStatusFilter(
      "All Status"
    );
    setPriorityFilter(
      "All Priority"
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F0EC] text-black">
      <TopNav />

      {/* =========================
          HEADER
      ========================== */}
      <header className="border-b border-[#004B5C]/10 bg-[#004B5C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Planet Indonesia
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Scaling and Partnership Management Sprint
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Scaling &amp;
                Partnership
                Sprint
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Last synced
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {loading
                  ? "Syncing from Notion..."
                  : lastSynced
                  ? formatLastEdited(
                      lastSynced.toISOString()
                    )
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-white/45">
                Notion is the source
                of truth
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* =========================
            CURRENT SPRINT
        ========================== */}
        <section id="overview">
          <SectionHeading
            eyebrow="Current sprint"
            title="Sprint snapshot"
          />

          {error ? (
            <div className="mt-5 rounded-2xl border border-[#730A2D]/20 bg-white p-5 shadow-sm">
              <p className="font-medium text-[#730A2D]">
                Unable to load
                Notion data
              </p>

              <p className="mt-1 text-sm leading-6 text-black/60">
                {error}
              </p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Sprint progress"
              value={
                trackedProgress ===
                null
                  ? "—"
                  : `${trackedProgress.toFixed(
                      1
                    )}%`
              }
              detail="Average of tasks with progress"
            />

            <MetricCard
              label="Active tasks"
              value={
                loading
                  ? "…"
                  : String(
                      activeWork.length
                    )
              }
              detail="Current sprint"
            />

            <MetricCard
              label="Completed"
              value={
                loading
                  ? "…"
                  : String(
                      completedActiveTasks.length
                    )
              }
              detail="Tasks marked Done"
            />

            <MetricCard
              label="Attention"
              value={
                loading
                  ? "…"
                  : String(
                      attentionItems.length
                    )
              }
              detail="Items requiring follow-up"
            />
          </div>
        </section>

        {/* =========================
            MANAGEMENT SUMMARY
        ========================== */}
        <section className="mt-8 rounded-2xl border border-[#004B5C]/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
            Management view
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#004B5C] md:text-2xl">
            Current work is being
            consolidated from Notion.
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-black/65">
            This page brings
            together current sprint
            work, progress,
            deadlines, recent
            changes, and items that
            may need follow-up.
            Detailed task
            information remains
            managed in Notion.
          </p>
        </section>

        {/* =========================
            WHAT CHANGED
        ========================== */}
        <section className="mt-8">
          <SectionHeading
            eyebrow="Since last update"
            title="What changed"
          />

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ChangeCard
              symbol="↑"
              title="Progress updates"
              text={
                activeWork.length ===
                0
                  ? "No active sprint data available."
                  : `${
                      activeWork.filter(
                        (
                          task
                        ) =>
                          normalizedProgress(
                            task.progress
                          ) !== null
                      ).length
                    } active tasks currently have tracked progress.`
              }
            />

            <ChangeCard
              symbol="✓"
              title="Completed work"
              text={
                completedActiveTasks.length ===
                0
                  ? "No active sprint task is currently marked Done."
                  : completedActiveTasks.length ===
                    1
                  ? "1 active sprint task is currently marked Done."
                  : `${completedActiveTasks.length} active sprint tasks are currently marked Done.`
              }
            />

            <ChangeCard
              symbol="!"
              title="New attention"
              text={
                attentionItems.length ===
                0
                  ? "No active sprint item currently matches the attention rules."
                  : attentionItems.length ===
                    1
                  ? "1 active sprint item needs follow-up based on current status, dates, or assignment."
                  : `${attentionItems.length} active sprint items need follow-up based on current status, dates, or assignment.`
              }
            />
          </div>
        </section>

        {/* =========================
            ATTENTION REQUIRED
        ========================== */}
        <section className="mt-8 rounded-2xl border border-[#730A2D]/15 bg-white p-6 shadow-sm">
          <SectionHeading
            eyebrow="Attention required"
            title="What needs attention"
          />

          <div className="mt-5">
            {loading ? (
              <div className="rounded-xl bg-[#F7F0EC] p-5 text-sm text-black/55">
                Checking current
                sprint items...
              </div>
            ) : attentionItems.length ===
              0 ? (
              <div className="rounded-xl border border-dashed border-[#004B5C]/15 bg-[#F7F0EC] p-5">
                <p className="text-sm font-medium text-[#004B5C]">
                  No active attention
                  items detected.
                </p>

                <p className="mt-1 text-sm leading-6 text-black/55">
                  The current rules
                  check overdue items,
                  critical tasks with no
                  progress after their
                  start date, deadlines
                  within seven days, and
                  unassigned work.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attentionItems.map(
                  (task) => {
                    const reason =
                      attentionReason(
                        task
                      );

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-[#730A2D]/10 bg-[#F7F0EC] p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {reason ? (
                                <span className="rounded-full bg-[#F7DDE4] px-2.5 py-1 text-xs font-semibold text-[#730A2D]">
                                  {reason ===
                                  "overdue"
                                    ? "Overdue"
                                    : reason ===
                                      "critical-no-progress"
                                    ? "Critical with no progress"
                                    : reason ===
                                      "due-soon"
                                    ? "Due within 7 days"
                                    : "No PIC assigned"}
                                </span>
                              ) : null}

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  statusTone[
                                    task.status
                                  ] ??
                                  "bg-black/5 text-black"
                                }`}
                              >
                                {
                                  task.status
                                }
                              </span>
                            </div>

                            <p className="mt-2 font-semibold text-[#004B5C]">
                              {task.name}
                            </p>

                            <p className="mt-1 text-sm text-black/55">
                              PIC:{" "}
                              {task.assignedTo
                                .length >
                              0
                                ? task.assignedTo.join(
                                    ", "
                                  )
                                : "Not assigned"}
                            </p>
                          </div>

                          <div className="shrink-0 text-left text-sm md:text-right">
                            <p className="text-xs uppercase tracking-[0.1em] text-black/40">
                              Due
                            </p>

                            <p className="mt-1 font-medium text-black/70">
                              {formatDate(
                                task.dueDate
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* =========================
            ACTIVE WORK
        ========================== */}
        <section
          id="active-work"
          className="mt-8"
        >
          <SectionHeading
            eyebrow="Current work"
            title="Active work"
          />

          {/* Search + Filter */}
          <div className="mt-5 rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_190px_190px]">
              {/* Search */}
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-4-4" />
                  </svg>
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search task, PIC, or keyword..."
                  className="w-full rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] py-3 pl-11 pr-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-[#004B5C]/30 focus:ring-2 focus:ring-[#004B5C]/10"
                />
              </div>

              {/* PIC */}
              <select
                value={picFilter}
                onChange={(event) =>
                  setPicFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] px-4 py-3 text-sm text-[#004B5C] outline-none focus:border-[#004B5C]/30"
              >
                <option value="All PIC">
                  All PIC
                </option>

                {picOptions.map(
                  (person) => (
                    <option
                      key={person}
                      value={person}
                    >
                      {person}
                    </option>
                  )
                )}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] px-4 py-3 text-sm text-[#004B5C] outline-none focus:border-[#004B5C]/30"
              >
                <option value="All Status">
                  All Status
                </option>

                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              {/* Priority */}
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] px-4 py-3 text-sm text-[#004B5C] outline-none focus:border-[#004B5C]/30"
              >
                <option value="All Priority">
                  All Priority
                </option>

                {priorityOptions.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-[#004B5C]/10 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-black/50">
                Showing{" "}
                <span className="font-semibold text-[#004B5C]">
                  {
                    filteredActiveWork.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#004B5C]">
                  {
                    activeWork.length
                  }
                </span>{" "}
                active tasks
              </p>

              {(searchQuery ||
                picFilter !==
                  "All PIC" ||
                statusFilter !==
                  "All Status" ||
                priorityFilter !==
                  "All Priority") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-medium text-[#730A2D] transition hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Task results */}
          <div className="mt-5 space-y-4">
            {loading ? (
              <>
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </>
            ) : filteredActiveWork.length ===
              0 ? (
              <div className="rounded-2xl border border-dashed border-[#004B5C]/15 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F0EC] text-[#004B5C]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>

                <p className="mt-4 font-medium text-[#004B5C]">
                  No matching tasks
                  found.
                </p>

                <p className="mt-1 text-sm text-black/50">
                  Try another keyword or
                  clear the filters.
                </p>
              </div>
            ) : (
              filteredActiveWork.map(
                (task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                  />
                )
              )
            )}
          </div>
        </section>

        {/* =========================
            SPRINT OVERVIEW
        ========================== */}
        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <InfoPanel
            eyebrow="Sprint overview"
            title="Current state"
          >
            <InfoRow
              label="Active tasks"
              value={String(
                activeWork.length
              )}
            />

            <InfoRow
              label="In progress"
              value={String(
                activeWork.filter(
                  (task) =>
                    task.status ===
                    "In progress"
                ).length
              )}
            />

            <InfoRow
              label="Not started"
              value={String(
                activeWork.filter(
                  (task) =>
                    task.status ===
                    "Not started"
                ).length
              )}
            />

            <InfoRow
              label="Done"
              value={String(
                completedActiveTasks.length
              )}
            />
          </InfoPanel>

          <InfoPanel
            eyebrow="Work composition"
            title="By priority"
          >
            <InfoRow
              label="Critical"
              value={String(
                activeWork.filter(
                  (task) =>
                    task.priority ===
                    "Critical"
                ).length
              )}
            />

            <InfoRow
              label="High Priority"
              value={String(
                activeWork.filter(
                  (task) =>
                    task.priority ===
                    "High Priority"
                ).length
              )}
            />

            <InfoRow
              label="Medium"
              value={String(
                activeWork.filter(
                  (task) =>
                    task.priority ===
                      "Medium" ||
                    task.priority ===
                      "Medium Priority"
                ).length
              )}
            />

            <InfoRow
              label="Low"
              value={String(
                activeWork.filter(
                  (task) =>
                    task.priority ===
                      "Low" ||
                    task.priority ===
                      "Low Priority"
                ).length
              )}
            />
          </InfoPanel>

          <InfoPanel
            eyebrow="Upcoming"
            title="Next Sprint"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold text-[#004B5C]">
                  {
                    nextSprint.length
                  }
                </p>

                <p className="mt-1 text-sm text-black/50">
                  planned tasks
                </p>
              </div>

              <div className="rounded-xl bg-[#F7F0EC] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.1em] text-black/40">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-[#004B5C]">
                  Next Sprint
                </p>
              </div>
            </div>

            {nextSprint.length >
            0 ? (
              <div className="mt-4 space-y-2">
                {nextSprint
                  .slice(
                    0,
                    3
                  )
                  .map(
                    (task) => (
                      <div
                        key={
                          task.id
                        }
                        className="rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] p-3"
                      >
                        <p className="text-sm font-medium text-[#004B5C]">
                          {
                            task.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-black/45">
                          {task
                            .assignedTo
                            .length >
                          0
                            ? task.assignedTo.join(
                                ", "
                              )
                            : "Not assigned"}
                        </p>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-black/50">
                No tasks currently
                planned for Next
                Sprint.
              </p>
            )}
          </InfoPanel>
        </section>

        {/* =========================
            BACKLOG
        ========================== */}
        <section className="mt-8 rounded-2xl border border-[#004B5C]/10 bg-white p-6 shadow-sm">
          <SectionHeading
            eyebrow="Outside sprint planning"
            title="Backlog / other work"
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-semibold text-[#004B5C]">
                {
                  outsideSprint.length
                }
              </p>

              <p className="mt-1 text-sm text-black/50">
                tasks without a
                sprint assignment
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-[0.1em] text-black/40">
                Planning note
              </p>

              <p className="mt-1 text-sm text-black/55">
                These items remain
                visible but are not
                included in Active
                Sprint progress.
              </p>
            </div>
          </div>

          {outsideSprint.length >
          0 ? (
            <div className="mt-5 space-y-3">
              {outsideSprint
                .slice(
                  0,
                  5
                )
                .map(
                  (task) => (
                    <div
                      key={
                        task.id
                      }
                      className="rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                statusTone[
                                  task.status
                                ] ??
                                "bg-black/5 text-black"
                              }`}
                            >
                              {
                                task.status
                              }
                            </span>

                            {task.priority ? (
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  priorityTone[
                                    task.priority
                                  ] ??
                                  "bg-black/5 text-black"
                                }`}
                              >
                                {
                                  task.priority
                                }
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 font-medium text-[#004B5C]">
                            {
                              task.name
                            }
                          </p>
                        </div>

                        <div className="shrink-0 text-sm text-black/50 md:text-right">
                          <p>
                            PIC:{" "}
                            {task.assignedTo
                              .length >
                            0
                              ? task.assignedTo.join(
                                  ", "
                                )
                              : "—"}
                          </p>

                          <p className="mt-1">
                            Due:{" "}
                            {formatDate(
                              task.dueDate
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-[#004B5C]/15 bg-[#F7F0EC] p-5">
              <p className="text-sm text-black/55">
                No additional work
                outside sprint
                planning.
              </p>
            </div>
          )}
        </section>

        {/* =========================
            MONITORING TIMELINE
        ========================== */}
        <section className="mt-8 rounded-2xl border border-[#004B5C]/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Current work"
              title="Monitoring timeline"
            />

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F7F0EC] px-3 py-1.5 text-xs font-semibold text-[#004B5C]">
                {
                  timelineTasks.length
                }{" "}
                tasks on timeline
              </span>

              {timelineTasksWithoutDates.length >
              0 ? (
                <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-black/50">
                  {
                    timelineTasksWithoutDates.length
                  }{" "}
                  without complete
                  dates
                </span>
              ) : null}
            </div>
          </div>

          {timelineRange &&
          timelineTasks.length >
            0 ? (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Timeline header */}
                <div className="grid grid-cols-[270px_minmax(0,1fr)] gap-5">
                  <div />

                  <div className="relative h-12 border-b border-[#004B5C]/10">
                    {timelineMonths.map(
                      (month) => (
                        <div
                          key={`${month.label}-${month.left}`}
                          className="absolute top-0 h-full border-l border-[#004B5C]/10 px-2"
                          style={{
                            left: `${month.left}%`,
                            width: `${month.width}%`,
                          }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/45">
                            {
                              month.label
                            }
                          </p>
                        </div>
                      )
                    )}

                    {todayPosition !==
                    null ? (
                      <div
                        className="absolute bottom-0 top-0 z-20"
                        style={{
                          left: `${todayPosition}%`,
                        }}
                      >
                        <div className="absolute -left-px bottom-0 top-0 w-px bg-[#730A2D]" />

                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#730A2D] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                          TODAY
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Timeline rows */}
                <div className="mt-1 space-y-1">
                  {timelineTasks.map(
                    (task) => {
                      const startMs =
                        dateValue(
                          task.startDate!
                        );

                      const dueMs =
                        dateValue(
                          task.dueDate!
                        );

                      const left =
                        ((startMs -
                          timelineRange.startMs) /
                          timelineRange.totalMs) *
                        100;

                      const right =
                        ((dueMs -
                          timelineRange.startMs) /
                          timelineRange.totalMs) *
                        100;

                      const width =
                        Math.max(
                          right - left,
                          1.5
                        );

                      const barTone =
                        task.status ===
                        "Done"
                          ? "bg-[#5F8E6B]"
                          : task.status ===
                            "QA"
                          ? "bg-[#FFB432]"
                          : task.status ===
                            "Not started"
                          ? "bg-black/25"
                          : "bg-[#004B5C]";

                      return (
                        <div
                          key={
                            task.id
                          }
                          className="grid grid-cols-[270px_minmax(0,1fr)] gap-5"
                        >
                          {/* Task info */}
                          <div className="flex min-w-0 flex-col justify-center border-b border-[#004B5C]/5 py-3">
                            <p
                              className="truncate text-sm font-semibold text-[#004B5C]"
                              title={
                                task.name
                              }
                            >
                              {
                                task.name
                              }
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/45">
                              <span>
                                PIC:{" "}
                                {task.assignedTo
                                  .length >
                                0
                                  ? task.assignedTo.join(
                                      ", "
                                    )
                                  : "Not assigned"}
                              </span>

                              <span>
                                {
                                  formatDate(
                                    task.startDate
                                  )
                                }{" "}
                                →{" "}
                                {
                                  formatDate(
                                    task.dueDate
                                  )
                                }
                              </span>
                            </div>
                          </div>

                          {/* ONE LONG TIMELINE BAR */}
                          <div className="relative flex min-h-[68px] items-center overflow-hidden border-b border-[#004B5C]/5">
                            {/* Background */}
                            <div className="absolute inset-0 bg-[#F7F0EC]/50" />

                            {/* Month lines */}
                            {timelineMonths.map(
                              (
                                month
                              ) => (
                                <div
                                  key={`grid-${task.id}-${month.label}-${month.left}`}
                                  className="absolute bottom-0 top-0 border-l border-[#004B5C]/5"
                                  style={{
                                    left: `${month.left}%`,
                                  }}
                                />
                              )
                            )}

                            {/* Today */}
                            {todayPosition !==
                            null ? (
                              <div
                                className="absolute bottom-0 top-0 z-10 w-px bg-[#730A2D]/45"
                                style={{
                                  left: `${todayPosition}%`,
                                }}
                              />
                            ) : null}

                            {/* Task bar */}
                            <div
                              className={`absolute z-20 h-8 rounded-lg shadow-sm transition-all hover:brightness-95 ${barTone}`}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}
                              title={`${task.name} | ${task.startDate} → ${task.dueDate}`}
                            >
                              <div className="flex h-full items-center px-3">
                                <span className="truncate text-xs font-semibold text-white">
                                  {
                                    task.name
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-[#004B5C]/15 bg-[#F7F0EC] p-6">
              <p className="text-sm font-medium text-[#004B5C]">
                No task with both
                Start Date and Due
                Date can currently be
                displayed on the
                timeline.
              </p>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-black/50">
                Tasks without complete
                dates remain in the work
                list but are not placed
                on the timeline bar.
              </p>
            </div>
          )}
        </section>

        {/* =========================
            FOOTER
        ========================== */}
        <footer className="mt-10 border-t border-[#004B5C]/10 pt-5 text-sm text-black/45">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>
              Planet Indonesia · Scaling
              &amp; Partnership Management
            </p>

            <p>
              Notion is the source of
              truth. Website is a
              read-only management view.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* =========================
   SECTION HEADING
========================= */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#730A2D]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-semibold text-[#004B5C]">
        {title}
      </h2>
    </div>
  );
}

/* =========================
   METRIC CARD
========================= */

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#004B5C]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-black/50">
        {detail}
      </p>
    </div>
  );
}

/* =========================
   CHANGE CARD
========================= */

function ChangeCard({
  symbol,
  title,
  text,
}: {
  symbol: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB432]/25 font-semibold text-[#004B5C]">
          {symbol}
        </span>

        <h3 className="font-semibold text-[#004B5C]">
          {title}
        </h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-black/60">
        {text}
      </p>
    </div>
  );
}

/* =========================
   INFO PANEL
========================= */

function InfoPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#004B5C]/10 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-semibold text-[#004B5C]">
        {title}
      </h3>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}

/* =========================
   INFO ROW
========================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#004B5C]/10 py-3 last:border-b-0">
      <span className="text-sm text-black/55">
        {label}
      </span>

      <span className="text-sm font-semibold text-[#004B5C]">
        {value}
      </span>
    </div>
  );
}

/* =========================
   SKELETON
========================= */

function TaskSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#004B5C]/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-[#F7F0EC]" />
            <div className="h-6 w-28 rounded-full bg-[#F7F0EC]" />
          </div>

          <div className="mt-4 h-6 w-3/4 rounded bg-[#F7F0EC]" />

          <div className="mt-4 flex gap-6">
            <div className="h-4 w-36 rounded bg-[#F7F0EC]" />
            <div className="h-4 w-28 rounded bg-[#F7F0EC]" />
          </div>
        </div>

        <div className="w-full max-w-xs">
          <div className="flex justify-between">
            <div className="h-4 w-16 rounded bg-[#F7F0EC]" />
            <div className="h-6 w-12 rounded bg-[#F7F0EC]" />
          </div>

          <div className="mt-2 h-2 rounded-full bg-[#F7F0EC]" />
        </div>
      </div>
    </div>
  );
}

/* =========================
   TASK CARD
========================= */

function TaskCard({
  task,
}: {
  task: Task;
}) {
  const [open, setOpen] =
    useState(false);

  const [
    loadingSubtasks,
    setLoadingSubtasks,
  ] = useState(false);

  const [subtaskError, setSubtaskError] =
    useState("");

  const [subtaskData, setSubtaskData] =
    useState<SubtaskResponse | null>(
      null
    );

  const progress =
    normalizedProgress(
      task.progress
    );

  async function toggleSubtasks() {
    if (
      task.subtaskCount ===
      0
    ) {
      return;
    }

    if (subtaskData) {
      setOpen(
        (value) => !value
      );
      return;
    }

    try {
      setOpen(true);
      setLoadingSubtasks(
        true
      );
      setSubtaskError("");

      const response =
        await fetch(
          `/api/notion/tasks/${task.id}/subtasks`,
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Failed to load subtasks (${response.status})`
        );
      }

      const data =
        await response.json();

      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Invalid subtask response."
        );
      }

      setSubtaskData(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load subtasks.";

      setSubtaskError(
        message
      );
    } finally {
      setLoadingSubtasks(
        false
      );
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#004B5C]/10 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  statusTone[
                    task.status
                  ] ??
                  "bg-black/5 text-black/65"
                }`}
              >
                {
                  task.status
                }
              </span>

              {task.priority ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    priorityTone[
                      task.priority
                    ] ??
                    "bg-black/5 text-black/65"
                  }`}
                >
                  {
                    task.priority
                  }
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-lg font-semibold leading-7 text-[#004B5C]">
              {task.name}
            </h3>

            {task.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">
                {
                  task.description
                }
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/50">
              <span>
                <strong className="text-black/70">
                  PIC:
                </strong>{" "}
                {task.assignedTo
                  .length > 0
                  ? task.assignedTo.join(
                      ", "
                    )
                  : "Not assigned"}
              </span>

              <span>
                <strong className="text-black/70">
                  Due:
                </strong>{" "}
                {formatDate(
                  task.dueDate
                )}
              </span>

              <span>
                <strong className="text-black/70">
                  Start:
                </strong>{" "}
                {formatDate(
                  task.startDate
                )}
              </span>

              <span>
                <strong className="text-black/70">
                  Subtasks:
                </strong>{" "}
                {
                  task.subtaskCount
                }
              </span>
            </div>
          </div>

          <div className="w-full max-w-xs lg:w-72">
            <div className="flex items-end justify-between text-sm">
              <span className="font-medium text-black/55">
                Progress
              </span>

              <span className="text-xl font-semibold text-[#004B5C]">
                {progressLabel(
                  task.progress
                )}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#004B5C]/10">
              <div
                className="h-full rounded-full bg-[#004B5C] transition-all"
                style={{
                  width: `${
                    progress ?? 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#004B5C]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-black/40">
            Last edited:{" "}
            {formatLastEdited(
              task.lastEdited
            )}
          </p>

          {task.subtaskCount >
          0 ? (
            <button
              type="button"
              onClick={
                toggleSubtasks
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#004B5C]/10 bg-[#F7F0EC] px-4 py-2 text-sm font-medium text-[#004B5C] transition hover:border-[#004B5C]/20 hover:bg-[#004B5C]/5"
            >
              <span>
                {open
                  ? "Hide subtasks"
                  : "View subtasks"}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${
                  open
                    ? "rotate-180"
                    : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ) : (
            <span className="rounded-xl bg-[#F7F0EC] px-4 py-2 text-sm text-black/45">
              No subtasks
            </span>
          )}
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#004B5C]/10 bg-[#F7F0EC] px-5 py-5">
          {loadingSubtasks ? (
            <div className="rounded-xl bg-white p-4 text-sm text-black/50">
              Loading subtasks...
            </div>
          ) : subtaskError ? (
            <div className="rounded-xl border border-[#730A2D]/15 bg-white p-4">
              <p className="text-sm font-medium text-[#730A2D]">
                Unable to load
                subtasks
              </p>

              <p className="mt-1 text-sm text-black/55">
                {
                  subtaskError
                }
              </p>
            </div>
          ) : subtaskData ? (
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                    Task breakdown
                  </p>

                  <p className="mt-1 font-semibold text-[#004B5C]">
                    {
                      subtaskData.completedCount
                    }{" "}
                    completed ·{" "}
                    {
                      subtaskData.remainingCount
                    }{" "}
                    remaining
                  </p>
                </div>

                <p className="text-xs text-black/45">
                  {
                    subtaskData.count
                  }{" "}
                  total subtasks
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {subtaskData.subtasks.map(
                  (subtask) => (
                    <div
                      key={
                        subtask.id
                      }
                      className="rounded-xl border border-[#004B5C]/10 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            subtask.done
                              ? "bg-[#E4F1E8] text-[#28613B]"
                              : "bg-[#F7F0EC] text-black/35"
                          }`}
                        >
                          {subtask.done
                            ? "✓"
                            : ""}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${
                              subtask.done
                                ? "text-black/45 line-through"
                                : "text-[#004B5C]"
                            }`}
                          >
                            {
                              subtask.name
                            }
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-black/45">
                            <span>
                              PIC:{" "}
                              {subtask.assignedTo
                                .length >
                              0
                                ? subtask.assignedTo.join(
                                    ", "
                                  )
                                : "—"}
                            </span>

                            <span>
                              Due:{" "}
                              {formatDate(
                                subtask.dueDate
                              )}
                            </span>
                          </div>

                          {subtask.notes ? (
                            <p className="mt-2 text-xs leading-5 text-black/50">
                              {
                                subtask.notes
                              }
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {subtaskData
                  .subtasks
                  .length ===
                0 ? (
                  <div className="rounded-xl bg-white p-4 text-sm text-black/50">
                    No subtask
                    details returned
                    from Notion.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}