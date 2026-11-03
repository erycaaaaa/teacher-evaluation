# Question Bank Guru PJOK

## Tujuan

SPA pendamping alur penelitian Kaggle `dpo-guru`: guru memberi anotasi Yes/No pada template Feedback atau evaluasi blind A/B dari paket JSON. Website juga menyediakan chatbot PJOK melalui API FastAPI.

## Fitur

- Dua bagian website: Ruang Guru (`#/guru`) dan Chatbot (`#/chatbot`).
- Mode anotasi Yes/No dari file XLSX/CSV dan mode evaluasi A/B dari paket JSON.
- Rubrik anotasi dapat dimuat dari sheet `Rubrik`; guru memberi skor 1–5 per kriteria dan Yes/No. Ekspor memuat sheet `Feedback` + `Rubrik` + `Skor` jika ada skor; CSV/template lama memakai rubrik default.
- Data tugas tidak dibuat otomatis: semua tugas dimuat dari file pengguna.
- Autosave lokal, progres kelas, ekspor sesuai format notebook, dan backup/pemulihan.
- Chat PJOK yang mengambil jawaban hanya dari `POST /chat`.
- Penyimpanan browser menggunakan `localStorage`; tidak ada database aplikasi.

## Quick start

```powershell
npm ci
Copy-Item .env.example .env
```

Isi `VITE_API_URL` dengan URL ngrok aktif dan `VITE_API_KEY` dengan API key backend, lalu:

```powershell
npm run dev
```

Buka `http://localhost:5173`. Untuk backend, jalankan deployment cell Langkah 22 pada notebook Kaggle. Detail terdapat pada [panduan instalasi](./docs/INSTALLATION.md), [konfigurasi lingkungan](./docs/ENV.md), dan [runbook](./docs/RUNBOOK.md).

> Nilai `VITE_API_KEY` dimasukkan ke bundle browser. Jangan gunakan key dengan hak istimewa pada situs publik; gunakan proxy server-side untuk deployment produksi.

## Dokumentasi

Mulai dari [indeks dokumentasi](./docs/INDEX.md). Panduan pengembangan ada pada [CONTRIBUTING.md](./CONTRIBUTING.md).

## Dokumen terkait

- [Indeks dokumentasi](./docs/INDEX.md)
- [Asumsi dan pertanyaan terbuka](./docs/ASSUMPTIONS.md)
- [Arsitektur aplikasi](./docs/ARCHITECTURE.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
