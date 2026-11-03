# User Flow

## Tujuan

Menjelaskan alur dua bagian website dan mode Guru yang dipilih dari jenis file.

## Ruang Guru

1. Buka `#/guru`; belum ada tugas menampilkan instruksi untuk memuat file, bukan data contoh.
2. Klik **Muat tugas**:
   - `.xlsx` memakai sheet `Feedback`, serta sheet `Rubrik`/`Skor` bila ada; CSV dan file lama tanpa Rubrik memakai rubrik default. Semua mengaktifkan **Mode: Anotasi (Yes/No + skor)**.
   - `.json` paket versi 2 dengan `set=validasi` atau `set=final_test` mengaktifkan **Mode: Evaluasi (A/B, 5 kriteria)**.
3. Jika mengganti berkas yang berpotensi mengganti data mode, konfirmasi meminta guru mengekspor atau mencadangkan lebih dahulu.
4. Mode anotasi: baca pertanyaan/konteks/rubrik, pilih skor 1–5 per kriteria dan Yes atau No untuk setiap jawaban. Peringatan konsistensi skor/label tidak menghalangi navigasi.
5. Simpan hasil sebagai `feedback_guru_<kodeGuru>.xlsx`; sheet `Feedback` tetap enam kolom, disertai `Rubrik` dan `Skor` bila ada skor terisi.
6. Mode evaluasi: nilai A/B secara buta dengan lima kriteria, keputusan, dan komentar wajib; jawaban identik dinilai sebagai satu jawaban.
7. Penilaian tersimpan otomatis di browser. Progres dihitung per kelas; filter yang tidak menemukan tugas menjelaskan cara mengubah filter.
8. Ekspor hasil `.xlsx` untuk Kaggle dan buat backup `.json` berkala.

Navigasi anotasi tidak mensyaratkan skor lengkap atau pasangan tepat satu Yes dan satu No. Tombol **Berikutnya** hanya nonaktif pada tugas terakhir yang tampil; selesaikan alur dengan **Simpan hasil saya (.xlsx)**. Jika filter kelas menyisakan satu tugas, tugas itu diperlakukan sebagai tugas terakhir.

## Chatbot

1. Buka `#/chatbot`.
2. Health check `/health` menunjukkan ketersediaan layanan.
3. Isi materi dan pertanyaan, pilih stage jika tersedia, lalu kirim.
4. UI menampilkan jawaban hanya dari respons API valid; kegagalan menampilkan pesan error.

## Dokumen Terkait

- [Sitemap](./SITEMAP.md)
- [Use cases](./USE_CASE.md)
- [API](./API.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.4.0
