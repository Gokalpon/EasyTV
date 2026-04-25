import ProgressSidebar from "./components/ProgressSidebar";
import WorkspacePanel from "./components/WorkspacePanel";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-app-bg text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.24),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(76,29,149,0.25),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.14),transparent_36%)]" />
      <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[110px]" />
      <div className="absolute right-8 top-10 h-60 w-60 rounded-full bg-indigo-500/20 blur-[130px]" />

      <div className="relative mx-auto flex max-w-[1600px] gap-6 p-6 pb-8 lg:pr-[25rem]">
        <WorkspacePanel />
      </div>

      <div className="relative px-6 pb-8 lg:hidden">
        <ProgressSidebar mobile />
      </div>

      <div className="fixed bottom-6 right-6 top-6 hidden w-[360px] lg:block">
        <ProgressSidebar />
      </div>
    </div>
  );
}
