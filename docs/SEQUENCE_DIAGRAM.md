# Sequence Diagrams

## Tujuan

Memperlihatkan urutan interaksi untuk anotasi, evaluasi, chat, dan backup.

## UC-01: anotasi Feedback

```mermaid
sequenceDiagram
  actor Guru
  participant UI as GuruPage / AnotasiGuruPage
  participant Loader as feedback.ts + rubrik.ts + skor.ts + XLSX
  participant Store as localStorage
  participant File as File lokal
  Guru->>UI: Pilih template XLSX/CSV
  UI->>Loader: Parse Feedback, Rubrik, dan Skor bila ada
  Loader-->>UI: Kelompok per ID + rubrik/skor + warning
  UI->>Store: Simpan template, baris, rubrik, dan skor
  UI->>Store: Autosave status Yes/No
  Guru->>UI: Nilai jawaban memakai rubrik
  Guru->>UI: Simpan hasil
  UI->>File: Unduh Feedback 6 kolom + Rubrik + Skor terisi
```

## UC-02: evaluasi blind A/B

```mermaid
sequenceDiagram
  actor Guru
  participant UI as GuruPage / EvaluasiGuruPage
  participant Paket as paket.ts
  participant Blind as blind.ts
  participant Store as localStorage
  participant File as XLSX
  Guru->>UI: Pilih paket JSON versi 2
  UI->>Paket: Validasi set dan seluruh field tugas
  Paket-->>UI: Paket valid atau pesan error
  UI-->>Guru: Tampilkan A/B tanpa identitas model
  Guru->>UI: Isi skor, keputusan, komentar
  UI->>Blind: Petakan label untuk hasil
  UI->>Store: Autosave penilaian
  Guru->>UI: Ekspor hasil
  UI->>File: Evaluasi_Guru 27 kolom + Audit_Trail
```

## UC-03: chatbot

```mermaid
sequenceDiagram
  actor User as Pengguna
  participant UI as ChatbotPage
  participant Client as chatApi
  participant API as FastAPI
  participant Model as Model SFT/DPO
  UI->>Client: cekHealth()
  Client->>API: GET /health
  API-->>UI: HealthResponse
  User->>UI: Isi context dan pertanyaan
  UI->>Client: kirimChat()
  Client->>API: POST /chat
  API->>Model: Inferensi
  Model-->>API: Jawaban
  API-->>UI: ChatResponse
  UI-->>User: Jawaban backend
```

## UC-04: backup/pulihkan

```mermaid
sequenceDiagram
  actor Guru
  participant UI
  participant Backup as backup.ts
  participant Store as localStorage
  participant File as JSON
  Guru->>UI: Cadangkan data
  UI->>Backup: buatCadanganData()
  Backup->>Store: Ambil key qb_* aman
  Backup-->>UI: BackupPayload
  UI->>File: Unduh JSON
  Guru->>UI: Pilih file pemulihan
  UI->>Backup: pulihkanCadanganData()
  Backup->>Store: Pulihkan key yang diizinkan
```

## Dokumen Terkait

- [Use cases](./USE_CASE.md)
- [API](./API.md)
- [Flowchart](./FLOWCHART.md)
- [Components](./COMPONENTS.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
