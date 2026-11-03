# Database Schema dan Persistence

## Tujuan

Mencatat storage yang digunakan aplikasi dan membedakannya dari database relasional.

## Database relasional

**Tidak digunakan.** Tidak ada tabel SQL, migration, DDL, ORM, atau foreign key. Data penilaian disimpan dalam `localStorage` dan file lokal.

## Key storage

| Key | Nilai | Validasi/default |
|---|---|---|
| `qb_guru_mode_v1` | `anotasi` atau `evaluasi` | Dipilih dari ekstensi file. |
| `qb_guru_anotasi_template_v1` | Identitas template terakhir | Diperbarui setelah template berhasil diparse. |
| `qb_guru_anotasi_rows_v1` | Array baris Feedback | Enam field template; status kosong/Yes/No. |
| `qb_guru_anotasi_rubrik_v1` | Array `RubrikRow` | Rubrik template terakhir; default untuk CSV, template lama, atau sheet Rubrik tidak valid. |
| `qb_guru_anotasi_skor_v1` | `Record<string, SkorJawaban>` | Nilai skor 1–5 per kunci JSON `(id, jawaban)` dan nama kriteria. |
| `qb_guru_anotasi_warnings_v1` | Array string warning | ID kosong atau jumlah baris tidak tepat dua. |
| `qb_guru_anotasi_export_snapshot_v1` | String JSON snapshot | Diperbarui setelah ekspor sukses. |
| `qb_guru_eval_paket_v1` | Paket JSON versi 2 | `set=validasi/final_test`; tugas tervalidasi sebelum digunakan. |
| `qb_guru_eval_data_v1` | `{ hasil, audit, draf }` | Autosave lokal untuk Mode Evaluasi. |
| `qb_guru_eval_export_snapshot_v1` | String JSON hasil | Snapshot terakhir hasil evaluasi yang diekspor. |
| `qb_guru_profil_v1` | `GuruProfil` | Kode maksimal 12 karakter; kelas 1–6. |

Semua key memakai prefix `qb_`, sehingga backup Guru mencakup data kedua mode termasuk rubrik anotasi. Tidak ada auto-sync lintas browser/origin.

## DDL

```sql
-- Tidak berlaku: aplikasi tidak menggunakan database SQL.
```

## Dokumen Terkait

- [Relasi](./RELATIONS.md)
- [Data dictionary](./DATA_DICTIONARY.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
