# Testing

## Tujuan

Mencatat pengujian parser template, paket evaluasi, workbook, persistence, dan chatbot.

## Tooling dan suite

- Vitest (`npm test`).
- TypeScript dan Vite production build (`npm run build`).
- Belum ada browser E2E runner.

| Area | File |
|---|---|
| Feedback template parse, warning, stable order | `src/lib/__tests__/feedback.test.ts` |
| Sheet Rubrik, fallback, alias header, batas input, round-trip | `src/lib/__tests__/rubrik.test.ts` |
| Sheet Skor, validasi/filter baris, urutan, round-trip, toggle skor | `src/lib/__tests__/skor.test.ts` |
| Feedback/Rubrik/Skor dan evaluasi XLSX, urutan kolom, formula-safe text | `src/lib/__tests__/exportXlsx.test.ts` |
| Paket validasi/final_test dan leakage guard parser | `src/lib/__tests__/paket.test.ts` |
| Rubrik dinamis, kotak skor, konsistensi Yes/No, dan Mode Evaluasi | `src/pages/__tests__/guruModes.test.tsx` |
| Blind mapping | `src/lib/__tests__/blind.test.ts` |
| Backup/restore dua mode dan key rubrik/skor | `src/lib/__tests__/backup.test.ts` |
| Chat API contract/error | `src/lib/__tests__/chatApi.test.ts` |

## Jalankan

```powershell
npm test
npm run build
```

## Coba manual

1. Jalankan backend Kaggle jika menguji chatbot; untuk penilaian, tidak perlu backend.
2. Unduh `template_feedback_guru.xlsx` dari Kaggle.
3. Buka Ruang Guru, **Muat tugas**, pilih template; verifikasi label **Mode: Anotasi (Yes/No)**.
4. Verifikasi rubrik berasal dari sheet `Rubrik`; muat juga template lama tanpa sheet tersebut untuk memastikan fallback default. Isi kotak skor 1–5 dan Yes/No, lalu simpan hasil. Cek `Feedback` tetap enam kolom (`id, kelas, pertanyaan, context, jawaban, status`), `Rubrik`, dan `Skor` format panjang bila skor terisi.
5. Muat `paket_tugas_guru.json`; verifikasi label **Mode: Evaluasi (A/B, 5 kriteria)**.
6. Lengkapi lima skor, keputusan bila jawaban berbeda, dan komentar; ekspor dan pastikan 27 kolom `Evaluasi_Guru` dipertahankan.
7. Uji konfirmasi pergantian mode, backup/restore rubrik dan skor, round-trip workbook anotasi, formula-like text di Rubrik/Skor, ID berawalan nol, pasangan tidak lengkap, dan filter kelas tanpa hasil.
8. Uji Chatbot terpisah melalui health/API sesuai [API](./API.md).
9. Di Mode Anotasi dengan minimal dua ID, isi Yes/No dan semua skor pada tugas pertama; pastikan **Berikutnya** aktif. Ulangi dengan Yes/Yes dan No/No; peringatan harus tampil tanpa menonaktifkan navigasi. Pada tugas terakhir, **Berikutnya** nonaktif dan ekspor tetap tersedia.

## Dokumen Terkait

- [Installation](./INSTALLATION.md)
- [API](./API.md)
- [CI/CD](./CI_CD.md)
- [NFR](./NFR.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.4.0
