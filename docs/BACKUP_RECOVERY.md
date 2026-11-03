# Backup and Recovery

## Tujuan

Menjelaskan cadangan data lokal Guru untuk kedua mode.

`src/lib/backup.ts` mengumpulkan seluruh key `qb_*` yang tidak mengandung nama key rahasia, lalu membuat `BackupPayload` versi 2 (`app`, `versi`, `waktu`, `data`).

Data yang dicakup:

- Template, rubrik, skor, status Yes/No, dan snapshot ekspor Mode Anotasi. Key `qb_guru_anotasi_rubrik_v1` dan `qb_guru_anotasi_skor_v1` ikut payload versi 2 tanpa perubahan format.
- Paket, draf, hasil, audit, dan snapshot ekspor Mode Evaluasi.
- Mode terakhir dan profil Guru.

## Backup

1. Di Ruang Guru pilih **Cadangkan data (.json)**.
2. Simpan file di lokasi privat dan aman; file dapat berisi data penelitian.
3. Ekspor hasil `.xlsx` untuk tiap mode secara berkala. Backup JSON bukan pengganti pengiriman hasil workbook ke Kaggle.

## Recovery

1. Buka website pada browser/origin yang dituju.
2. Pilih **Pulihkan cadangan** dan file JSON.
3. Data yang tervalidasi dipulihkan ke `localStorage`, lalu halaman dimuat ulang.
4. Pastikan mode, paket/template, rubrik anotasi, dan penilaian tampil sesuai harapan.

Tidak ada server-side backup, sinkronisasi lintas perangkat, atau pemulihan point-in-time. Jangan menghapus data browser sebelum mengekspor dan menyimpan backup.

## Dokumen Terkait

- [Database schema/persistence](./DATABASE_SCHEMA.md)
- [Integrations](./INTEGRATIONS.md)
- [Runbook](./RUNBOOK.md)
- [Security](./SECURITY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
