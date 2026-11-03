# Use Cases

## Tujuan

Mendefinisikan alur utama yang tersedia bagi pengguna website.

## Aktor

| Aktor | Kebutuhan |
|---|---|
| Guru anotator/evaluator | Menilai file nyata yang dibuat oleh alur penelitian Kaggle. |
| Pengguna chatbot | Mengirim materi dan pertanyaan ke layanan model. |
| FastAPI/model | Layanan eksternal chatbot. |

## UC-01 — Anotasi jawaban

- **Precondition:** template anotasi XLSX/CSV tersedia.
- **Postcondition:** status Yes/No tersimpan lokal dan dapat diunduh dalam format notebook.
- **Skenario utama:** muat template → validasi sheet/kolom `Feedback` → baca Rubrik/Skor bila tersedia → beri skor 1–5 per kriteria dan Yes/No → ekspor `Feedback` + `Rubrik` + `Skor` bila skor terisi.
- **Alternatif:** file tanpa kolom wajib ditolak; sheet Rubrik tidak ada memakai default, sedangkan rubrik/skor rusak memberi peringatan tanpa menggagalkan pemuatan; baris skor asing/tidak valid diabaikan; peringatan konsistensi Yes/No tidak memblokir navigasi.

## UC-02 — Evaluasi jawaban buta

- **Precondition:** paket JSON versi 2 dengan set `validasi` atau `final_test`.
- **Postcondition:** penilaian lengkap tersimpan lokal dan dapat diekspor ke workbook evaluasi.
- **Skenario utama:** muat paket → validasi field → tinjau konteks/rubrik → beri skor lima kriteria dan keputusan A/B bila jawaban berbeda → isi komentar → simpan dan ekspor.
- **Alternatif:** data belum lengkap tidak dapat disimpan; jawaban identik tampil sebagai satu jawaban; mapping model tidak ditampilkan.

## UC-03 — Chat berdasarkan materi

- **Precondition:** API chatbot tersedia dan konfigurasi valid.
- **Postcondition sukses:** respons API yang valid ditampilkan.
- **Alternatif:** validasi input, status jaringan, timeout, atau error HTTP ditampilkan sebagai pesan ramah tanpa jawaban buatan.

## UC-04 — Backup/pulihkan

- **Precondition:** storage browser dapat diakses.
- **Skenario utama:** kumpulkan key `qb_*` non-secret → unduh JSON; saat pulih, validasi bentuk data dan tulis kembali key yang diizinkan.
- **Batas:** backup lokal bukan sinkronisasi cloud dan mencakup data dari kedua mode.

## Dokumen Terkait

- [User flow](./USER_FLOW.md)
- [Sequence diagrams](./SEQUENCE_DIAGRAM.md)
- [Business rules](./BUSINESS_RULES.md)
- [Error handling](./ERROR_HANDLING.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
