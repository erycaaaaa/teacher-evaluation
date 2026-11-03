# ERD Konseptual

## Tujuan

Memvisualisasikan struktur file dan state browser. Diagram bukan skema database relasional.

```mermaid
erDiagram
  PAKET_EVALUASI ||--|{ TUGAS_EVALUASI : memuat
  FILE_FEEDBACK ||--|{ BARIS_FEEDBACK : memuat
  FILE_FEEDBACK ||--|{ KRITERIA_RUBRIK : membawa
  BARIS_FEEDBACK ||--o{ SKOR_ANOTASI : dinilai
  KRITERIA_RUBRIK ||--o{ SKOR_ANOTASI : menjadi_kriteria
  TUGAS_EVALUASI ||--o| HASIL_EVALUASI : dinilai
  PROFIL_GURU ||--o{ HASIL_EVALUASI : membuat
  BACKUP_PAYLOAD ||--o{ BACKUP_ENTRY : membungkus

  PAKET_EVALUASI {
    number versi
    string dibuat
    string set
    number siklus
  }
  TUGAS_EVALUASI {
    string id
    string_or_number kelas
    string pertanyaan
    string acuan
    string context
    string sft
    string dpo
    boolean identik
  }
  FILE_FEEDBACK {
    string nama_file
  }
  BARIS_FEEDBACK {
    string id
    string kelas
    string pertanyaan
    string context
    string jawaban
    string status
  }
  KRITERIA_RUBRIK {
    string kriteria
    string skor1
    string skor3
    string skor5
  }
  SKOR_ANOTASI {
    string id
    string jawaban
    string kriteria
    number skor
  }
  HASIL_EVALUASI {
    string id
    array skorSFT
    array skorDPO
    string keputusan
    string komentar
    string waktu
  }
  PROFIL_GURU {
    string kode
    array kelas
    boolean hanya
  }
  BACKUP_PAYLOAD {
    string app
    number versi
    string waktu
  }
  BACKUP_ENTRY {
    string key
    string value
  }
```

`string_or_number` adalah union pada JSON, bukan tipe SQL. Relasi menunjukkan kumpulan data dalam file/localStorage; aplikasi tidak memiliki foreign key atau database relasional.

## Dokumen Terkait

- [Relasi](./RELATIONS.md)
- [Database schema](./DATABASE_SCHEMA.md)
- [Data dictionary](./DATA_DICTIONARY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.2.0
