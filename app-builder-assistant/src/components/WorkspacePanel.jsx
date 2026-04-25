import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";

const quickPrompts = [
  "Yeni Electron plugin sistemi oluştur",
  "React router ile çoklu ekran mimarisi kur",
  "Tailwind component library üret",
  "Build pipeline optimizasyonu yap"
];

export default function WorkspacePanel() {
  const commandInput = useTaskStore((state) => state.commandInput);
  const logs = useTaskStore((state) => state.logs);
  const setCommandInput = useTaskStore((state) => state.setCommandInput);
  const executeCommand = useTaskStore((state) => state.executeCommand);
  const resetFlow = useTaskStore((state) => state.resetFlow);

  const activeLogCount = useMemo(() => logs.length, [logs]);

  async function handleSubmit(event) {
    event.preventDefault();
    await executeCommand(commandInput);
  }

  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col gap-6">
      <div className="glass-panel animate-flow-in p-6">
        <p className="font-display text-[11px] uppercase tracking-[0.36em] text-cyan-100/80">
          App Builder Assistant
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-white md:text-4xl">
          Local App-Builder Mimarisi Tek Ekranda
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Doğal dil komutlarını gönder, build planını ve sistem çıktısını anlık izle.
          Yan panel proje durumunu sürekli görünür tutar.
        </p>
      </div>

      <div className="glass-panel animate-flow-in p-5 [animation-delay:90ms]">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setCommandInput(prompt)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label
            htmlFor="command-input"
            className="font-display text-xs uppercase tracking-[0.24em] text-slate-300"
          >
            Vibe Komutu
          </label>
          <textarea
            id="command-input"
            rows={4}
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            placeholder="Örn: Monorepo starter oluştur, auth + billing + deploy pipeline kur."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-body text-sm text-slate-100 outline-none ring-cyan-300/0 transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/30"
            >
              Komutu Çalıştır
            </button>
            <button
              type="button"
              onClick={resetFlow}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Akışı Sıfırla
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel animate-flow-in flex flex-1 flex-col p-5 [animation-delay:140ms]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base text-white">Output Stream</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300">
            {activeLogCount} satır
          </span>
        </div>

        <div className="h-[340px] flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/35 p-3">
          <ul className="space-y-2 font-mono text-[12px] leading-relaxed">
            {logs.map((log) => (
              <li
                key={log.id}
                className={`rounded-lg px-3 py-2 ${
                  log.level === "command"
                    ? "bg-cyan-500/12 text-cyan-100"
                    : "bg-white/5 text-slate-200"
                }`}
              >
                <span className="mr-2 text-slate-400">{log.time}</span>
                <span>{log.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
