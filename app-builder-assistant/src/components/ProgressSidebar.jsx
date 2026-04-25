import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";

const STATUS_META = {
  done: {
    icon: "🟢",
    label: "DONE",
    card: "bg-white/5 border-white/10 opacity-65",
    tag: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/25"
  },
  in_progress: {
    icon: "🟡",
    label: "IN PROGRESS",
    card: "bg-cyan-500/12 border-cyan-300/35 shadow-glow",
    tag: "bg-cyan-300/20 text-cyan-100 border border-cyan-300/35 animate-pulse-soft"
  },
  pending: {
    icon: "⚪",
    label: "PENDING",
    card: "bg-slate-900/55 border-white/10 opacity-85",
    tag: "bg-slate-500/15 text-slate-300 border border-slate-500/25"
  }
};

function TaskCard({ task }) {
  const meta = STATUS_META[task.status];

  return (
    <article
      className={`rounded-2xl border p-4 transition-all duration-300 ${meta.card}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm tracking-wide text-white">{task.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{task.detail}</p>
        </div>
      </div>
      <span
        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] ${meta.tag}`}
      >
        {meta.label}
      </span>
    </article>
  );
}

export default function ProgressSidebar({ mobile = false }) {
  const tasks = useTaskStore((state) => state.tasks);

  const counters = useMemo(
    () => ({
      done: tasks.filter((task) => task.status === "done").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      pending: tasks.filter((task) => task.status === "pending").length
    }),
    [tasks]
  );

  return (
    <aside
      className={`glass-panel flex h-full flex-col ${
        mobile ? "w-full" : "w-[360px]"
      }`}
    >
      <header className="border-b border-white/10 px-5 py-4">
        <p className="font-display text-[11px] uppercase tracking-[0.3em] text-cyan-100/80">
          Progress Sidebar
        </p>
        <h2 className="mt-2 font-display text-lg text-white">Sabit Proje Takibi</h2>
      </header>

      <div className="grid grid-cols-3 gap-2 border-b border-white/10 px-5 py-3 text-center text-[11px]">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 py-2">
          <p className="font-display text-emerald-200">{counters.done}</p>
          <p className="mt-0.5 text-[10px] tracking-wide text-emerald-100/80">DONE</p>
        </div>
        <div className="rounded-lg border border-cyan-400/40 bg-cyan-500/15 py-2">
          <p className="font-display text-cyan-100">{counters.inProgress}</p>
          <p className="mt-0.5 text-[10px] tracking-wide text-cyan-100/80">ACTIVE</p>
        </div>
        <div className="rounded-lg border border-slate-400/30 bg-slate-600/15 py-2">
          <p className="font-display text-slate-200">{counters.pending}</p>
          <p className="mt-0.5 text-[10px] tracking-wide text-slate-300/80">QUEUE</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-5 py-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </aside>
  );
}
