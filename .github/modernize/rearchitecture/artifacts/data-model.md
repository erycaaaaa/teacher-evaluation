# Model Data Existing

Data berikut adalah interface TypeScript dan kontrak berkas. Tidak ada skema database relasional/ORM di repository.

## Entitas

- **Tugas**: `id`, `kelas`, `pertanyaan`, `acuan`, `context`, `varian`, `sft`, `dpo`, `identik`, `sumber?`.
- **PaketTugas**: `versi`, `dibuat`, `set?`, `siklus?`, `tugas[]`, `tugasAnotasi?[]`. Set yang dipakai: `anotasi`, `validasi`, `final_test`.
- **GuruProfil**: `kode`, kelas yang dikuasai `kelas[]`, filter `hanya`.
- **PenilaianTugasMentah**: skor A/B berindeks kriteria, keputusan UI (`a`, `b`, `seri`, `tolak`, null), komentar, flag draf `kotor`.
- **HasilPenilaianTugas**: ID, skor SFT/DPO (masing-masing lima nilai), keputusan model, komentar, waktu, flag identik, pemetaan A/B, data mentah.
- **HasilAnotasiTugas**: ID, kode guru, siklus, label Yes/No/null untuk greedy/sampling, komentar, waktu.
- **PoolAnotasiItem**: ID, kelas, pertanyaan, context, dua kandidat greedy/sampling.
- **SiklusState**: nomor siklus, model aktif, fase, tanggal mulai/tinjau, ambang, snapshots preferensi, checklist DPO, aturan gate, keputusan, flag final test, riwayat, catatan protokol, status verifikasi EOS.
- **MetrikFinalTestState**: daftar metrik tahap dan daftar CI; kolom extensible pada interface metrik.

## Relasi konseptual

Paket memiliki banyak tugas; tugas memiliki hasil penilaian per guru. Paket anotasi opsional mengelompokkan item/kandidat, yang dapat memiliki hasil label. Siklus menyimpan riwayat dan snapshot. Metrik final test memiliki beberapa baris per tahap dan interval kepercayaan.

## Kontrak eksternal berkas

- Sheet Excel `Evaluasi_Guru`: tepat 27 kolom dengan urutan yang didefinisikan di `src/types/index.ts`/`src/lib/exportXlsx.ts`.
- Sheet feedback untuk notebook: tepat enam kolom `id`, `kelas`, `pertanyaan`, `context`, `jawaban`, `status`.
- JSON paket guru menyimpan versi, waktu pembuatan, metadata set/siklus dan array tugas.
- Metrik dibaca dari workbook notebook; sheet final wajib `SFT_vs_DPO_FinalTest`, CI opsional `SFT_vs_DPO_CI`.

## Persistensi

`localStorage` memuat objek serialized di key `qb_*`. Konsistensi antara entitas dijaga oleh logika frontend, bukan constraint database; transaksi multi-objek tidak tersedia.
