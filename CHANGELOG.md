# Changelog

## Tujuan

Semua perubahan penting project dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Riwayat sebelum dokumentasi ini dibuat belum tersedia di repo.

## [Unreleased]

### Changed

- Dokumentasi project disusun agar sesuai dengan aplikasi React/Vite, API Kaggle, dan penyimpanan browser yang ada.
- Ruang Guru dipisah menjadi mode anotasi Yes/No dan evaluasi A/B, dengan data yang dimuat pengguna.
- Loader template Feedback mendukung XLSX/CSV, ID berformat nol di depan, dan peringatan pasangan yang tidak tepat dua baris.
- Rute serta komponen peneliti dihapus; backup/restore tetap mencakup data lokal kedua mode.
- Workbook anotasi kini memuat sheet Rubrik opsional saat dibaca dan selalu mengekspor sheet `Feedback` + `Rubrik`; CSV dan template lama menggunakan rubrik default.
- Mode Anotasi menampilkan rubrik template secara read-only dan mencadangkan pilihan rubrik di localStorage; Mode Evaluasi tetap memakai lima kriteria default.
- Dokumentasi alur, kontrak workbook, state, dan backup diperbarui untuk rubrik anotasi.
- Mode Anotasi menambahkan skor 1–5 per kriteria untuk tiap jawaban; skor disimpan lokal, dapat dipulihkan dari sheet `Skor`, dan diekspor sebagai baris panjang.
- Peringatan konsistensi Yes/No dan skor ditampilkan tanpa menghalangi navigasi; parser Rubrik membatasi jumlah baris dan panjang sel.
- Ekspor sheet `Rubrik` dan `Skor` memakai sel teks eksplisit untuk mencegah nilai teks dibaca sebagai formula.

### Added

- Halaman Chatbot PJOK menggunakan `GET /health` dan `POST /chat`.
- Dokumentasi kontrak API, setup, kualitas, deployment, operasi, dan manajemen project.
- Parser/pembangun sheet Rubrik dan tes fallback, validasi header, ekspor workbook, UI mode, serta backup/restore.
- Parser/pembangun sheet Skor dan tes validasi, round-trip, sheet ekspor opsional, serta backup/restore.

## Dokumen Terkait

- [README](./README.md)
- [Indeks dokumentasi](./docs/INDEX.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.2.0
