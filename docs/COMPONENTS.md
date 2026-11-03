# Components

## Tujuan

Mencatat halaman, komponen, dan helper yang dipakai website saat ini.

## Halaman dan komponen

| Komponen | File | Tanggung jawab |
|---|---|---|
| `App` | `src/App.tsx` | Dua rute hash, header/footer. |
| `GuruPage` | `src/pages/GuruPage.tsx` | Deteksi jenis berkas, konfirmasi pergantian, backup/restore, dan label mode. |
| `AnotasiGuruPage` | `src/pages/AnotasiGuruPage.tsx` | Skor 1–5 per kriteria dan Yes/No per jawaban, rubrik read-only, autosave, progres, peringatan konsistensi, ekspor workbook anotasi. |
| `EvaluasiGuruPage` | `src/pages/EvaluasiGuruPage.tsx` | Evaluasi buta A/B, lima skor, keputusan/komentar, autosave, ekspor hasil. |
| `ChatbotPage` | `src/pages/ChatbotPage.tsx` | Health check, form dan respons chat API. |
| `RubrikTable` | `src/components/RubrikTable.tsx` | Menampilkan rubrik read-only dari prop; mode evaluasi selalu menerima rubrik default. |
| `ScoreRow` | `src/components/ScoreRow.tsx` | Input skor evaluasi lima kriteria; hanya dipakai Mode Evaluasi. |
| `SkorKriteriaRow` | `src/components/SkorKriteriaRow.tsx` | Input skor 1–5 per kriteria untuk satu jawaban pada Mode Anotasi. |
| `ProgressBoard` | `src/components/ProgressBoard.tsx` | Progres tugas per kelas. |

## Domain dan file

| Modul | Fungsi |
|---|---|
| `feedback.ts` | Parse template Feedback, peringatan jumlah baris, urutan tampilan stabil, identitas `(id, jawaban)`. |
| `rubrik.ts` | Parse sheet `Rubrik` secara toleran, fallback ke rubrik default, dan membangun sheet sesuai kontrak Kaggle. |
| `skor.ts` | Parse sheet `Skor`, abaikan baris tidak valid dengan warning, dan bangun sheet panjang berurutan. |
| `paket.ts` | Validasi paket notebook versi 2 dan parser dataset evaluasi. |
| `blind.ts` | Penempatan A/B dan pemetaan skor/keputusan tanpa membuka mapping di UI. |
| `exportXlsx.ts` | Workbook anotasi `Feedback` + `Rubrik` dan workbook `Evaluasi_Guru` sesuai kontrak notebook. |
| `backup.ts` | Backup/pemulihan semua key `qb_*` non-secret. |
| `chatApi.ts`, `chatConfig.ts` | Kontrak API chatbot; tidak berubah oleh penyederhanaan mode. |

## Dokumen Terkait

- [Sitemap](./SITEMAP.md)
- [Arsitektur](./ARCHITECTURE.md)
- [State management](./STATE_MANAGEMENT.md)
- [Struktur folder](./FOLDER_STRUCTURE.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
