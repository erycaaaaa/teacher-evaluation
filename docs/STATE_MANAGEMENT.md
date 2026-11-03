# State Management

## Tujuan

Mendokumentasikan state navigasi, mode, autosave, dan API tanpa state manager pihak ketiga.

## Lapisan state

| Jenis | Lokasi | Contoh |
|---|---|---|
| Navigasi | `window.location.hash` | `#/guru`, `#/chatbot`; hash lain kembali ke Guru. |
| Mode Guru | React state + `qb_guru_mode_v1` | `anotasi` atau `evaluasi`, dipilih dari ekstensi file. |
| UI transient | React state | Indeks tugas, loading ekspor, pesan, rubrik terbuka. |
| Data anotasi | `localStorage` | `qb_guru_anotasi_template_v1`, `qb_guru_anotasi_rows_v1`, `qb_guru_anotasi_rubrik_v1`, `qb_guru_anotasi_skor_v1`, warnings, export snapshot. |
| Data evaluasi | `localStorage` | `qb_guru_eval_paket_v1`, `qb_guru_eval_data_v1`, export snapshot. |
| Profil Guru | `localStorage` | `qb_guru_profil_v1`, dipakai bersama untuk kode/kelas/filter. |
| Chat | React state + fetch | Health/ChatResponse; tidak disimpan sebagai penilaian. |
| Pertukaran | File lokal | CSV/XLSX anotasi, JSON evaluasi, XLSX hasil, backup JSON. |

Rubrik anotasi dibaca dari `qb_guru_anotasi_rubrik_v1`; template XLSX baru menggantinya, sedangkan template tanpa sheet Rubrik memakai default. Skor tiap kriteria disimpan per kunci JSON `(id, jawaban)` pada `qb_guru_anotasi_skor_v1` setiap perubahan. Mode Evaluasi selalu menggunakan rubrik default dan tidak membaca rubrik/skor anotasi.

Autosave kedua mode menggunakan key terpisah sehingga memuat satu jenis file tidak menimpa penilaian mode lainnya. Backup memilih seluruh key `qb_*` yang tidak mengandung nama secret, termasuk data rubrik anotasi.

## Dokumen Terkait

- [Arsitektur](./ARCHITECTURE.md)
- [Database schema / persistence](./DATABASE_SCHEMA.md)
- [Components](./COMPONENTS.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
