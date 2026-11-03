# Business Rules

## Tujuan

Mencatat aturan mode anotasi, evaluasi, penyimpanan, dan chatbot yang dijalankan oleh source.

| ID | Aturan | Implementasi |
|---|---|---|
| BR-001 | `.xlsx`/`.csv` memilih Mode Anotasi; `.json` memilih Mode Evaluasi. | `GuruPage.tsx`. |
| BR-002 | XLSX anotasi memerlukan sheet `Feedback`; CSV memakai header yang sama. Kolom wajib tetap `id, pertanyaan, jawaban, status`, sedangkan `kelas` dan `context` dipertahankan jika tersedia. Sheet XLSX `Rubrik` dan `Skor` opsional; rubrik yang tidak ada memakai default, sedangkan sheet rubrik/skor rusak memberi peringatan dan tidak menggagalkan pemuatan. | `feedback.ts`, `rubrik.ts`, `skor.ts`. |
| BR-003 | ID anotasi tetap berupa teks; setiap ID diharapkan memiliki tepat dua baris, dan penyimpangan ditampilkan sebagai peringatan. | `feedback.ts`. |
| BR-004 | Setiap jawaban anotasi memiliki pilihan skor 1–5 per kriteria dan Yes/No wajib. Skor tidak wajib secara default (`ANOTASI_SKOR_WAJIB=false`). Pasangan Yes/Yes atau No/No tetap menampilkan pesan tidak menghasilkan preferensi jelas. | `AnotasiGuruPage.tsx`, `SkorKriteriaRow.tsx`, `constants.ts`. |
| BR-005 | Urutan tampilan jawaban deterministik per ID, sedangkan ekspor mengikuti urutan baris sumber. UI tidak menampilkan label asal kandidat. | `feedback.ts`, `exportXlsx.ts`. |
| BR-006 | Paket evaluasi harus versi 2 dengan `set=validasi` atau `final_test`, `siklus` integer, dan field tugas sesuai kontrak notebook. | `validatePaketGuru` di `paket.ts`. |
| BR-007 | Evaluasi memakai lima kriteria wajib, keputusan A/B untuk jawaban tidak identik, dan komentar wajib. Jawaban identik dinilai satu kali. | `EvaluasiGuruPage.tsx`. |
| BR-008 | Label A/B tetap blind; hasil ekspor memetakan kembali skor sesuai hash ID, tetapi UI tidak mengungkap mapping. | `blind.ts`. |
| BR-009 | Penilaian tersimpan di browser dan tidak dikirim ke server; key anotasi dan evaluasi dipisahkan. | `localStorage` pada halaman Guru. |
| BR-010 | Pergantian mode/berkas yang mengganti data memerlukan konfirmasi dan menganjurkan ekspor/backup. | `GuruPage.tsx`. |
| BR-011 | Ekspor anotasi berisi sheet `Feedback` dengan enam kolom template dalam urutan sumber tanpa skor tambahan, sheet `Rubrik`, dan sheet `Skor` format panjang bila ada skor terisi. | `buildFeedbackWorkbook`. |
| BR-012 | Ekspor evaluasi mempertahankan sheet `Evaluasi_Guru` dengan 27 kolom dan `Audit_Trail`. | `buildHasilGuruWorkbook`. |
| BR-013 | Backup hanya memuat key `qb_*` dan mengabaikan key dengan nama secret/token/password/API key. | `backup.ts`. |
| BR-014 | Chat hanya menampilkan jawaban dari respons API sukses yang tervalidasi. | `chatApi.ts`, `ChatbotPage.tsx`. |
| BR-015 | Yes dengan skor di bawah `ANOTASI_YES_MIN_SKOR` dan No dengan seluruh kriteria bernilai minimal `ANOTASI_NO_SEMUA_TINGGI` menampilkan peringatan non-blocking. | `skor.ts`, `AnotasiGuruPage.tsx`. |

Aturan tambahan untuk interpretasi label Yes/No diatur melalui `ANOTASI_YES_NO_RULE` pada `src/lib/constants.ts`. Nilai awalnya kosong; tanpa teks tambahan UI hanya menampilkan petunjuk umum.

## Dokumen Terkait

- [Flowchart](./FLOWCHART.md)
- [Use cases](./USE_CASE.md)
- [Data dictionary](./DATA_DICTIONARY.md)
- [Testing](./TESTING.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
