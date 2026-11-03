# State Diagram

## Tujuan

Menggambarkan pemilihan mode Guru dan siklus request chatbot.

## Mode Ruang Guru

```mermaid
stateDiagram-v2
  [*] --> tanpa_tugas
  tanpa_tugas --> validasi_anotasi: Muat XLSX/CSV
  tanpa_tugas --> validasi_evaluasi: Muat JSON
  validasi_anotasi --> anotasi: Feedback valid
  validasi_anotasi --> tanpa_tugas: File invalid
  validasi_evaluasi --> evaluasi: Paket versi 2 valid
  validasi_evaluasi --> tanpa_tugas: Paket invalid
  anotasi --> anotasi: Simpan Yes/No secara lokal
  evaluasi --> evaluasi: Simpan skor/keputusan/komentar secara lokal
  anotasi --> validasi_evaluasi: Konfirmasi pergantian mode
  evaluasi --> validasi_anotasi: Konfirmasi pergantian mode
```

Data anotasi dan evaluasi dipersistenkan dalam key terpisah; berpindah mode tidak otomatis menghapus data mode lainnya.

## Siklus request chatbot (transient)

```mermaid
stateDiagram-v2
  [*] --> memeriksa_health
  memeriksa_health --> siap: HealthResponse valid
  memeriksa_health --> offline: request gagal / kontrak invalid
  offline --> memeriksa_health: cek ulang
  siap --> validasi_input: submit
  validasi_input --> siap: input invalid
  validasi_input --> mengirim: input valid
  mengirim --> sukses: response valid
  mengirim --> gagal: HTTP error / timeout / network
  sukses --> siap
  gagal --> siap: kirim ulang
```

## Dokumen Terkait

- [Data dictionary](./DATA_DICTIONARY.md)
- [Flowchart](./FLOWCHART.md)
- [API](./API.md)
- [Business rules](./BUSINESS_RULES.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.1.0
