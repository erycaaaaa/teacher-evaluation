# Struktur Proyek

## Klasifikasi

Frontend SPA statis, satu aplikasi/deployable, bukan monorepo dan bukan fullstack dalam repository ini. Backend model berada di notebook Kaggle eksternal.

## Entry point dan navigasi

- `index.html` memuat root `#root` dan `/src/main.tsx`.
- `src/main.tsx` memasang React 18 `StrictMode` dan `App`.
- `src/App.tsx` memilih `AdminPage` untuk `#/admin` (default) dan `GuruPage` untuk `#/guru`; hash listener mengubah halaman.
- GitHub Pages menerima `dist/` hasil Vite melalui workflow CI/CD.

## Lapisan dan domain fungsional

| Area | Berkas utama | Peran |
|---|---|---|
| Shell/navigasi | `src/App.tsx`, `src/main.tsx` | Entry point UI dan hash routing |
| Halaman peneliti | `src/pages/AdminPage.tsx`, `src/components/TabSiklus.tsx` | Impor/ekspor, panel siklus, final test, agregasi |
| Halaman guru | `src/pages/GuruPage.tsx` | Profil guru, rubrik A/B, autosave, hasil |
| Integrasi model | `src/components/LiveGeneratorModal.tsx`, `src/lib/api.ts` | Health check dan chat SFT/DPO ke FastAPI |
| Model data/kontrak | `src/types/index.ts` | Interface paket, tugas, hasil, anotasi, siklus, metrik |
| Domain | `src/lib/blind.ts`, `normalize.ts`, `paket.ts`, `anotasi.ts`, `siklus.ts`, `aggregate.ts` | Pemrosesan A/B, validasi impor, aturan penelitian, agregasi |
| I/O berkas dan browser | `src/lib/exportXlsx.ts`, `backup.ts`, `xlsxLoader.ts` | XLSX/JSON, backup/restore, lazy load SheetJS |
| Presentasi bersama | `src/components/ProgressBoard.tsx`, `RubrikTable.tsx`, `ScoreRow.tsx` | Progress dan UI rubrik/skor |
| Styling | `src/index.css`, Tailwind config | Gaya global dan utility CSS |

Jumlah sumber `src` yang teramati melalui pemindaian: 30 file; 20 `.ts`, 9 `.tsx`, 1 `.css`. Angka tidak memasukkan tes sebagai sumber runtime secara semantik (file tes juga berada di bawah `src/lib/__tests__`).

## Alur layer

Komponen React menerima aksi pengguna, mengelola state lokal dan memanggil fungsi domain di `src/lib`. Fungsi domain memvalidasi/mengolah JSON, CSV, atau XLSX melalui browser; state persisten ditulis ke `localStorage`. Satu klien HTTP opsional berkomunikasi ke FastAPI notebook. Tidak ada layer controller-service-repository server atau ORM.

## Konfigurasi utama

- `package.json` / `package-lock.json`: script dan dependensi.
- `tsconfig.json`: compiler TypeScript strict.
- `vite.config.ts`: plugin React, base relatif, server dev port 5173.
- `tailwind.config.js`, `postcss.config.js`: konfigurasi CSS.
- `.github/workflows/ci-cd.yml`: CI test/typecheck/build dan deploy Pages.
- `index.html`: shell dokumen.

## Kontrak interaksi

Permukaan eksternal aplikasi adalah rute hash `#/admin`, `#/guru`, impor/ekspor berkas dan endpoint notebook eksternal yang diakses dari generator live. Modul domain internal tidak memiliki rute tersendiri.
