import { create } from "zustand";

const initialTasks = [
  {
    id: "scope",
    title: "Ürün Kapsamı Tanımlandı",
    detail: "Hedef kullanıcı, modüller ve mimari sınırlar netleşti.",
    status: "done"
  },
  {
    id: "ui",
    title: "Glass UI Mizanpajı",
    detail: "Sabit yan panel + ana komut alanı aktif olarak geliştiriliyor.",
    status: "in_progress"
  },
  {
    id: "state",
    title: "Görev/State Orkestrasyonu",
    detail: "Zustand store ile komut-akış durumları bağlanacak.",
    status: "pending"
  },
  {
    id: "runner",
    title: "Yerel Build Worker",
    detail: "Terminal komutları ve canlı çıktı hattı bağlanacak.",
    status: "pending"
  }
];

const initialLogs = [
  {
    id: "seed-1",
    level: "system",
    message: "App Builder Asistanı başlatıldı.",
    time: "00:00:01"
  },
  {
    id: "seed-2",
    level: "system",
    message: "Bekleniyor: Doğal dil komutu girin.",
    time: "00:00:02"
  }
];

const statusOrder = ["done", "in_progress", "pending"];

function now() {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}

function advanceTasks(tasks) {
  const currentIndex = tasks.findIndex((task) => task.status === "in_progress");
  if (currentIndex < 0) {
    return tasks;
  }

  const nextIndex = tasks.findIndex(
    (task, index) => index > currentIndex && task.status === "pending"
  );

  return tasks.map((task, index) => {
    if (index === currentIndex) {
      return { ...task, status: "done" };
    }
    if (index === nextIndex) {
      return { ...task, status: "in_progress" };
    }
    return task;
  });
}

function sortTasks(tasks) {
  return [...tasks].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );
}

export const useTaskStore = create((set) => ({
  tasks: initialTasks,
  logs: initialLogs,
  commandInput: "",

  setCommandInput: (commandInput) => set({ commandInput }),

  executeCommand: async (rawCommand) => {
    const command = rawCommand.trim();
    if (!command) {
      return;
    }

    set((state) => ({
      commandInput: "",
      logs: [
        ...state.logs,
        {
          id: `usr-${Date.now()}`,
          level: "command",
          message: `> ${command}`,
          time: now()
        }
      ]
    }));

    let resultLines = [`[${now()}] "${command}" simülasyon modunda işlendi.`];

    try {
      if (window.desktopAPI?.runCommand) {
        const output = await window.desktopAPI.runCommand(command);
        if (Array.isArray(output) && output.length > 0) {
          resultLines = output;
        }
      }
    } catch (error) {
      resultLines = [`[${now()}] Hata: ${error.message}`];
    }

    set((state) => ({
      tasks: advanceTasks(state.tasks),
      logs: [
        ...state.logs,
        ...resultLines.map((line, index) => ({
          id: `sys-${Date.now()}-${index}`,
          level: "system",
          message: line,
          time: now()
        }))
      ]
    }));
  },

  resetFlow: () =>
    set({
      tasks: initialTasks,
      logs: initialLogs,
      commandInput: ""
    }),

  orderedTasks: () => sortTasks(initialTasks)
}));
