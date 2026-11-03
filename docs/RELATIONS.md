# Relasi Data

## Tujuan

Menjelaskan asosiasi konseptual data file dan localStorage tanpa mengklaim relasi SQL.

| Sumber | Kardinalitas | Target | Aturan |
|---|---:|---|---|
| `PaketTugas` | 1:N | `Tugas` | Paket evaluasi memiliki daftar tugas. |
| File template | 1:N | `FeedbackRow` | Setiap row menyimpan satu jawaban; dua row normalnya berbagi `id`. |
| Sheet `Rubrik` | 1:N | Kriteria rubrik | Rubrik dipakai UI anotasi dan mengikat skor per jawaban. |
| `FeedbackRow` | 1:N | Skor kriteria | Skor memakai kunci `(id, jawaban)` dan nama kriteria rubrik. |
| `Tugas` | 1:0..1 | `HasilPenilaianTugas` | Hasil memakai ID tugas sebagai key browser. |
| `GuruProfil` | 1:N konseptual | Hasil Guru | Kode anonim mengidentifikasi kontributor pada ekspor. |
| `BackupPayload` | 1:N | key/value | Backup membungkus key browser dengan prefix `qb_`. |

Tidak ada N:N, pivot table, foreign key, cascade rule, atau constraint SQL. Pemisahan dua mode terjadi melalui key storage yang berbeda.

## Key localStorage aktif

| Key | Data |
|---|---|
| `qb_guru_mode_v1` | Mode terakhir: `anotasi` atau `evaluasi`. |
| `qb_guru_anotasi_template_v1` | Identitas template terakhir. |
| `qb_guru_anotasi_rows_v1` | Baris Feedback, status dan urutan input. |
| `qb_guru_anotasi_rubrik_v1` | Array rubrik dari template anotasi atau rubrik default. |
| `qb_guru_anotasi_skor_v1` | Record skor per jawaban dan kriteria. |
| `qb_guru_anotasi_warnings_v1` | Peringatan struktur baris. |
| `qb_guru_anotasi_export_snapshot_v1` | Snapshot terakhir yang diekspor. |
| `qb_guru_eval_paket_v1` | Paket evaluasi versi 2. |
| `qb_guru_eval_data_v1` | Draf, hasil, dan audit evaluasi. |
| `qb_guru_eval_export_snapshot_v1` | Snapshot hasil evaluasi terakhir yang diekspor. |
| `qb_guru_profil_v1` | Kode guru, kelas, filter. |

## Dokumen Terkait

- [ERD](./ERD.md)
- [Database schema](./DATABASE_SCHEMA.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
