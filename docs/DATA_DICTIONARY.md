# Data Dictionary

## Tujuan

Menjelaskan field file anotasi, paket evaluasi, hasil evaluasi, localStorage, dan API chatbot.

## Konvensi

- Kolom template Feedback mengikuti nama notebook persis: `id`, `kelas`, `pertanyaan`, `context`, `jawaban`, `status`.
- ID anotasi disimpan/ekspor sebagai string, termasuk awalan dan nol di depan.
- Data penilaian disimpan per browser/origin; tidak ada tabel SQL.
- Label asal jawaban dan mapping SFT/DPO tidak ditampilkan kepada Guru.

## Template anotasi Feedback

Sheet XLSX bernama persis `Feedback`; CSV memakai header sama.

| Field | Tipe | Makna/aturan |
|---|---|---|
| `id` | string | ID grup dua jawaban, misalnya `PJOK_0315`; tidak diubah menjadi angka. |
| `kelas` | string | Kelas tugas; dipakai untuk progres/filter. |
| `pertanyaan` | string | Pertanyaan PJOK. |
| `context` | string | Materi referensi. |
| `jawaban` | string | Isi kandidat; key penilaian UI adalah `(id, jawaban)`. |
| `status` | string | Kosong, `Yes`, atau `No`; ekspor memakai kapitalisasi `Yes`/`No`. |

Notebook memakai baris dengan status yes/no, ID tidak kosong, dan jawaban tidak kosong. Satu ID normalnya mempunyai tepat dua baris. Urutan tampilan boleh dibalik stabil per ID; urutan ekspor selalu urutan input.

## Sheet Rubrik

Sheet XLSX bernama persis `Rubrik`. Header baris pertama mengikuti kontrak berikut:

| Header | Field `RubrikRow` | Makna |
|---|---|---|
| `kriteria` | `kriteria` | Nama kriteria yang tampil di UI. |
| `skor_1_kurang` | `skor1` | Deskripsi untuk skor 1 (Kurang). |
| `skor_3_cukup` | `skor3` | Deskripsi untuk skor 3 (Cukup). |
| `skor_5_baik` | `skor5` | Deskripsi untuk skor 5 (Baik). |

Header dicocokkan tanpa membedakan kapitalisasi dan spasi tepi. Nilai dibaca sebagai teks dan di-trim; baris tanpa `kriteria` dilewati. Sheet yang tidak ada memakai rubrik default. Sheet dengan header tidak lengkap atau tanpa baris valid menampilkan peringatan dan juga memakai default. CSV tidak memiliki sheet Rubrik dan selalu memakai default.
Parser menerima header `Kriteria`, `Skor 1`, `Skor 3`, `Skor 5` sebagai alias. Maksimal 20 baris diproses dan tiap sel dibatasi 500 karakter; nilai yang terpotong/kelebihan baris diberi peringatan.

## Sheet Skor

Sheet XLSX opsional dengan format panjang, satu baris per kriteria per jawaban:

| Header | Tipe | Aturan |
|---|---|---|
| `id` | string | Sama persis dengan ID pada baris `Feedback`. |
| `jawaban` | string | Sama persis dengan jawaban pada `Feedback`; dipasangkan dengan ID. |
| `kriteria` | string | Harus ada pada rubrik yang dipakai. |
| `skor` | integer | Nilai 1–5; hanya skor yang terisi diekspor. |

Baris skor dengan kriteria/ID-jawaban yang tidak dikenal atau nilai di luar 1–5 diabaikan dan dihitung dalam peringatan. Ekspor mengikuti urutan baris `Feedback` lalu urutan kriteria rubrik. Sheet `Skor` tidak dibuat bila belum ada nilai skor.

## Penyimpanan rubrik anotasi

| Key | Tipe | Makna |
|---|---|---|
| `qb_guru_anotasi_rubrik_v1` | `RubrikRow[]` JSON | Rubrik yang terakhir dimuat untuk Mode Anotasi; ikut backup karena memakai prefix `qb_`. |
| `qb_guru_anotasi_skor_v1` | `Record<string, SkorJawaban>` JSON | Skor tiap jawaban dengan kunci JSON `(id, jawaban)` dan nama kriteria; ikut backup. |

## Paket evaluasi

Top-level JSON: `versi: 2`, `dibuat: string`, `set: "validasi" | "final_test"`, `siklus: integer`, `tugas: Tugas[]`.

| Field `Tugas` | Tipe | Validasi |
|---|---|---|
| `id` | string | Tidak kosong dan unik dalam paket. |
| `kelas` | string \| number | Metadata kelas. |
| `pertanyaan` | string | Tidak kosong. |
| `acuan` | string | Jawaban referensi tidak kosong. |
| `context` | string | Materi referensi tidak kosong. |
| `varian` | string | Label varian; ekspor notebook memakai `fixed`. |
| `sft`, `dpo` | string | Jawaban kandidat model, tidak ditampilkan dengan identitas model. |
| `identik` | boolean | Menentukan penilaian satu jawaban atau blind A/B. |

## Data penilaian evaluasi

| Tipe/field | Arti |
|---|---|
| `GuruProfil.kode` | Kode anonim guru, maksimal 12 karakter. |
| `GuruProfil.kelas` | Daftar kelas 1–6. |
| `GuruProfil.hanya` | Aktifkan filter kelas. |
| `PenilaianTugasMentah.skorA`, `skorB` | Nilai 1–5 untuk lima kriteria. |
| `PenilaianTugasMentah.keputusan` | `a`, `b`, `seri`, `tolak`, atau `null`. |
| `PenilaianTugasMentah.komentar` | Komentar wajib sebelum simpan. |
| `HasilPenilaianTugas.skorSFT`, `skorDPO` | Lima skor hasil pemetaan blind untuk workbook. |
| `HasilPenilaianTugas.keputusan` | `dpo_lebih_baik`, `sft_lebih_baik`, `seri`, `keduanya_tidak_dapat_diterima`. |
| `HasilPenilaianTugas.penempatanA`, `penempatanB` | Mapping workbook internal; tidak dirender ke layar Guru. |
| `HasilPenilaianTugas.identik` | Menandakan jawaban identik. |

## Kolom workbook evaluasi Guru

Sheet `Evaluasi_Guru` mempunyai 27 kolom berurutan; sheet `Audit_Trail` menyimpan revisi.

```text
ID, Kode Guru, Kelas Dikuasai Guru, Kelas, Pertanyaan, Jawaban Acuan,
Varian Context, Jawaban SFT, Jawaban DPO, Penempatan A, Penempatan B,
SFT - Ketepatan Materi, SFT - Relevansi, SFT - Kejelasan Bahasa,
SFT - Kesesuaian Usia, SFT - Keamanan, DPO - Ketepatan Materi,
DPO - Relevansi, DPO - Kejelasan Bahasa, DPO - Kesesuaian Usia,
DPO - Keamanan, Keputusan, Komentar, Waktu, Identik, Set, Siklus
```

Nama dan urutan ini dipertahankan untuk pembacaan ulang notebook. Workbook anotasi berisi `Feedback` (enam kolom template, urutan baris sumber), `Rubrik`, dan `Skor` bila ada skor; tidak ada skor atau kolom tambahan pada `Feedback`.

## Chatbot API

| Field | Tipe | Aturan |
|---|---|---|
| `context` | string | Wajib, 1–12.000 karakter. |
| `pertanyaan` | string | Wajib, 1–1.000 karakter. |
| `model_stage` | `'sft' \| 'dpo'` | Opsional. |
| `max_new_tokens` | integer | Opsional, 8–256. |
| `jawaban` | string | Jawaban API yang tervalidasi. |
| `konteks_dipakai` | string | Konteks terpilih yang dikembalikan API. |
| `processing_time_ms` | integer | Durasi proses API. |

## Dokumen Terkait

- [ERD](./ERD.md)
- [API](./API.md)
- [Database schema](./DATABASE_SCHEMA.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
