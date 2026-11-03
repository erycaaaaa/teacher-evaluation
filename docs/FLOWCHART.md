# Flowchart Proses

## Tujuan

Menggambarkan alur file Guru, chatbot, serta backup yang tersedia.

## Pemilihan mode dan anotasi

```mermaid
flowchart TD
  A[Guru pilih Muat tugas] --> B{Jenis file?}
  B -->|XLSX / CSV| C[Parse template Feedback]
  C --> D{Sheet/header Feedback valid?}
  D -->|Tidak| E[Tampilkan pesan error]
  D -->|Ya| R[Parse Rubrik XLSX jika ada; CSV/file lama memakai default]
  R --> S[Parse Skor jika ada; validasi ID-jawaban, kriteria, dan nilai]
  S --> F[Kelompokkan row per ID dan beri warning jika jumlah bukan 2]
  F --> G[Mode Anotasi: tampilkan rubrik + Yes/No]
  G --> H[Autosave status lokal]
  H --> I[Ekspor Feedback 6 kolom + Rubrik + Skor terisi XLSX]
  B -->|JSON| J[Validasi paket versi 2 dan set]
  J -->|Tidak valid| E
  J -->|Valid| K[Mode Evaluasi: blind A/B dan lima kriteria]
  K --> L{Semua skor, keputusan, komentar lengkap?}
  L -->|Tidak| K
  L -->|Ya| M[Autosave dan ekspor XLSX evaluasi]
```

## Chatbot

```mermaid
flowchart TD
  A[Buka Chatbot] --> B[GET /health]
  B --> C{Health valid?}
  C -->|Tidak| D[Tampilkan offline]
  C -->|Ya| E[Isi context dan pertanyaan]
  E --> F{Validasi batas karakter}
  F -->|Tidak| G[Tampilkan validasi]
  F -->|Ya| H[POST /chat]
  H --> I{HTTP sukses dan respons valid?}
  I -->|Tidak| J[Tampilkan pesan error]
  I -->|Ya| K[Tampilkan jawaban backend]
```

## Backup/pemulihan

```mermaid
flowchart TD
  A[Pilih backup] --> B[Kumpulkan key qb_* yang aman]
  B --> C[Unduh JSON]
  D[Pilih restore JSON] --> E[Validasi payload dan prefix]
  E -->|Tidak valid| F[Tampilkan error]
  E -->|Valid| G[Pulihkan data kedua mode ke browser]
```

## Dokumen Terkait

- [User flow](./USER_FLOW.md)
- [Use cases](./USE_CASE.md)
- [Business rules](./BUSINESS_RULES.md)
- [State diagram](./STATE_DIAGRAM.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
