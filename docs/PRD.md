# Product Requirements Document

## Tujuan

Menetapkan kebutuhan website Question Bank Guru PJOK berdasarkan alur anotasi/evaluasi notebook Kaggle `dpo-guru.ipynb`.

## Produk dan pengguna

Website adalah SPA untuk guru yang menilai jawaban PJOK hasil proses penelitian di Kaggle dan pengguna chatbot. Semua file tugas disiapkan di luar website dan seluruh penilaian tersimpan lokal di browser.

| Persona | Kebutuhan | Bagian website |
|---|---|---|
| Guru anotator | Memberi label Yes/No pada dua jawaban dari template notebook. | Ruang Guru — Mode Anotasi |
| Guru evaluator | Menilai jawaban buta A/B berdasarkan lima kriteria, keputusan, dan komentar. | Ruang Guru — Mode Evaluasi |
| Pengguna chatbot | Meminta jawaban berdasarkan materi yang diberikan. | Chatbot |

## Scope

### In scope

- Dua bagian situs: `#/guru` dan `#/chatbot`.
- Deteksi mode Guru dari file `.xlsx`/`.csv` anotasi atau paket `.json` evaluasi.
- Anotasi Yes/No dengan template `Feedback` notebook, autosave, progres kelas, dan ekspor `.xlsx`.
- Evaluasi buta A/B dengan lima skor, keputusan, komentar wajib, autosave, serta ekspor kompatibel Kaggle.
- Backup/pemulihan `qb_*` di browser.
- Chat API `/health` dan `/chat` tanpa perubahan kontrak.

### Out of scope

- Persiapan dataset, training, agregasi, siklus penelitian, dan analisis hasil; seluruhnya dilakukan di Kaggle.
- Pengiriman data Guru ke server, login, database bersama, dan sinkronisasi antarperangkat.
- Data tugas bawaan; tugas hanya berasal dari file yang dimuat pengguna.

## Prioritas MoSCoW

| Prioritas | Kebutuhan |
|---|---|
| Must | Muat file nyata, pisahkan data kedua mode, validasi pasangan/template/paket, simpan lokal, ekspor sesuai notebook. |
| Must | Blind A/B; tidak mengungkap identitas kandidat atau mapping SFT/DPO. |
| Must | Peringatan risiko kehilangan data dan konfirmasi saat mengganti file/mode. |
| Must | Chat tetap memakai kontrak API dan hanya menampilkan jawaban backend yang tervalidasi. |
| Should | Filter kelas dan ringkasan progres kelas. |
| Could | Aturan tambahan Yes/No yang dapat diisi peneliti pada satu konstanta konfigurasi. |
| Won't | UI peneliti, generator pasangan, agregasi, final-test gate, dan data tugas bawaan. |

## Success metrics

| Metrik | Kriteria |
|---|---|
| Template anotasi | Sheet `Feedback` tetap enam kolom `id, kelas, pertanyaan, context, jawaban, status` dan urutan ekspor baris tetap; rubrik opsional dibaca dari sheet `Rubrik`; skor dapat dilanjutkan dari `Skor` dan diekspor format panjang. |
| Keamanan identitas | Tidak ada label asal kandidat atau mapping model pada tampilan Guru. |
| Evaluasi | Paket final_test versi 2 lolos validasi dan struktur XLSX 27 kolom tetap sama. |
| Persistence | Autosave kedua mode tersimpan di key berbeda dan tercakup backup/restore. |
| Kualitas | `npm test` dan `npm run build` lulus. |

## Dokumen Terkait

- [User flow](./USER_FLOW.md)
- [Arsitektur](./ARCHITECTURE.md)
- [Business rules](./BUSINESS_RULES.md)
- [Testing](./TESTING.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
