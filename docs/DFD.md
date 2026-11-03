# Data Flow Diagram

## Tujuan

Menjelaskan perpindahan file dan state lokal pada dua bagian website.

## Level 0 — context

```mermaid
flowchart LR
  Teacher[Guru] -->|Template Feedback / paket JSON dan penilaian| Website[Website Question Bank Guru PJOK]
  Website -->|Feedback XLSX / evaluasi XLSX / backup JSON| Teacher
  ChatUser[Pengguna chatbot] -->|context dan pertanyaan| Website
  Website -->|Jawaban API atau pesan error| ChatUser
  Website <-->|GET health / POST chat| API[FastAPI notebook Kaggle]
  API <--> Model[Model SFT / DPO]
```

## Level 1 — proses dan data store

```mermaid
flowchart TD
  Teacher[Guru]
  User[Pengguna chatbot]
  Input[File XLSX / CSV / JSON]
  P1[1. Deteksi dan validasi file]
  P2[2. Anotasi Yes/No]
  P3[3. Evaluasi blind A/B]
  P4[4. Ekspor hasil]
  P5[5. Backup / restore]
  P6[6. Chat]
  A[(qb_guru_anotasi_* localStorage)]
  E[(qb_guru_eval_* localStorage)]
  API[FastAPI notebook]
  Export[Feedback + Rubrik + Skor XLSX / Evaluasi XLSX / backup JSON]
  Teacher --> Input
  Input --> P1
  P1 -->|template anotasi| P2
  P1 -->|paket evaluasi| P3
  P2 <--> A
  P3 <--> E
  P2 --> P4
  P3 --> P4
  P4 --> Export
  Export --> Teacher
  A --> P5
  E --> P5
  P5 --> Export
  User --> P6
  P6 <-->|HTTP| API
```

File tugas dibaca lokal. Proses anotasi/evaluasi dan backup tidak mengirim data ke API; hanya alur chatbot yang berkomunikasi dengan backend.
Rubrik dan skor anotasi disimpan bersama data lokal `qb_guru_anotasi_*` dan tercakup dalam backup.

## Dokumen Terkait

- [Arsitektur](./ARCHITECTURE.md)
- [ERD](./ERD.md)
- [API](./API.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
