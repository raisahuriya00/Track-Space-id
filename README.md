# TrackSpace — Modular Workspace

> **A flexible workspace to organize projects, tasks, habits, and collaboration in one place.**

TrackSpace adalah aplikasi web manajemen project multi-project dengan workspace modular. Satu akun dapat membuat atau bergabung ke beberapa project. Setiap project dapat bertipe **Personal** atau **Shared** dan dapat mengaktifkan kombinasi modul sesuai kebutuhan: **Task Manager**, **Habit Tracker**, **Calendar**, serta **Progress & Reports**.

---

## 🚀 Fitur Utama

- **Multi-Project & Modular Workspace:** Konfigurasi modul per project (Task Manager, Habit Tracker, Calendar, Reports) tanpa kehilangan data saat modul dinonaktifkan.
- **Personal & Shared Projects:** Ruang kerja personal khusus pemilik, serta shared project untuk kolaborasi tim dan pembagian tugas.
- **Task Manager (List View):** Pengelolaan task dengan status dua arah (To Do, In Progress, Done), prioritas, deadline, dan penugasan (assignee).
- **Habit Tracker:** Pelacakan kebiasaan harian dan mingguan dengan daily checklist, logging terproteksi privasi, dan statistik konsistensi.
- **Integrated Calendar:** Kalender bulanan yang otomatis mengintegrasikan deadline task dan jadwal kebiasaan dari modul yang aktif.
- **Progress & Reports:** Analisis metrik penyelesaian task dan grafik visualisasi distribusi status & prioritas (Recharts).
- **Cross-Project Agregasi:** Halaman *Global My Tasks* dan *Global Calendar* untuk memantau beban kerja lintas project.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS
- **Icons & UI:** Lucide React, Tailwind Merge, CLSX
- **Charts:** Recharts
- **State & Data Fetching:** TanStack React Query v5
- **Routing:** React Router v7
- **Backend & Database:** Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security)

---

## 📂 Struktur Project

```text
Track-Space-id/
├── src/
│   ├── app/                 # Router, AppShell, navigasi global
│   ├── components/ui/       # Komponen reusable (Button, Input, Card, Modal, dll.)
│   ├── features/
│   │   ├── auth/            # AuthContext, Login, Register, ProtectedRoute
│   │   ├── dashboard/       # Main Dashboard lintas-project
│   │   ├── projects/        # Workspace, Wizard Create Project, Settings
│   │   ├── tasks/           # Task Manager (List View), Global My Tasks
│   │   ├── habits/          # Habit Tracker & daily logging
│   │   ├── calendar/        # Kalender terintegrasi
│   │   └── reports/         # Visualisasi chart & progress
│   ├── lib/                 # Supabase client, data service, utils
│   ├── styles/              # Tailwind index styles
│   └── types/               # TypeScript database types
├── supabase/
│   └── migrations/          # File migrasi SQL skema & RLS PostgreSQL
├── tests/                   # Acceptance test suite (PRD validation)
├── TrackSpace_PRD.md        # Product Requirements Document
└── package.json
```

---

## 💻 Cara Menjalankan Secara Lokal

### 1. Prasyarat
Pastikan **Node.js (v18+ atau v20+)** dan **npm** sudah terinstal.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (Opsional)
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi kredensial Supabase Anda jika ingin menghubungkan ke database live:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Aplikasi juga dilengkapi mode **Local Preview / Demo Instant** sehingga dapat dicoba langsung di browser tanpa konfigurasi Supabase awal).*

### 4. Jalankan Dev Server
```bash
npm run dev
```
Buka `http://localhost:3000` di browser Anda.

### 5. Menjalankan Automated Test
```bash
npm test
```

### 6. Build untuk Production
```bash
npm run build
```

---

## 📄 Database & Row Level Security (RLS)

Skema database PostgreSQL dan aturan Row Level Security (RLS) lengkap tersedia di [`supabase/migrations/20261108000000_trackspace_init.sql`](supabase/migrations/20261108000000_trackspace_init.sql).

---

## 📝 Lisensi

Proyek ini dikembangkan berdasarkan **TrackSpace PRD v1.0**.
