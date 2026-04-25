# App Builder Asistanı (Electron + React + Tailwind + Zustand)

## Kurulum

```bash
cd app-builder-assistant
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Klasör Yapısı

```text
app-builder-assistant/
├─ electron/
│  ├─ main.cjs
│  └─ preload.cjs
├─ src/
│  ├─ components/
│  │  ├─ ProgressSidebar.jsx
│  │  └─ WorkspacePanel.jsx
│  ├─ store/
│  │  └─ taskStore.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ postcss.config.cjs
├─ tailwind.config.cjs
└─ vite.config.js
```
