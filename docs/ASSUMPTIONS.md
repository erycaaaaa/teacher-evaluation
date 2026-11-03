# Asumsi dan Pertanyaan Terbuka

## Tujuan

Mencatat batas fakta yang diketahui dan hal yang belum dapat dipastikan dari repo. Dokumen ini mencegah rekomendasi atau rancangan dianggap sebagai perilaku yang sudah tersedia.

## Asumsi yang dipakai

| ID | Asumsi | Dasar / batas |
|---|---|---|
| ASM-001 | Nama produk dokumentasi adalah **Question Bank Guru PJOK**. | Judul pada `src/App.tsx`; manifest package bernama `guru-v1`. |
| ASM-002 | Skala proyek disebut kecil–menengah, bukan klasifikasi kapasitas terukur. | SPA dua bagian, tanpa database/server aplikasi penilaian. |
| ASM-003 | Notebook `dpo-guru.ipynb` adalah bagian dari sistem karena memuat backend FastAPI dan deployment ngrok. | Endpoint dan cell deployment ada pada notebook tersebut. |
| ASM-004 | Dokumentasi notebook hanya menjelaskan bagian yang bisa ditelusuri dari source; prosedur akun Kaggle/ngrok bergantung pada environment pemilik. | Token tidak tersedia di source; dikelola menggunakan Kaggle Secrets. |
| ASM-005 | Data evaluasi disimpan per browser/origin dan dipertukarkan manual melalui file. | Implementasi `localStorage`, impor/ekspor JSON, CSV, XLSX. |
| ASM-006 | API key frontend bersifat publik bagi siapa pun yang mengunduh bundle statis. | Vite mengekspos variabel `VITE_*` saat build. |
| ASM-007 | Persona website adalah Guru dan Pengguna Chatbot; kode guru hanya identifikasi lokal. | Tidak ada login atau authorization pengguna pada SPA. |
| ASM-008 | Skor anotasi dipasangkan ke baris Feedback melalui pasangan persis `(id, jawaban)`; nama kriteria mengikuti sheet Rubrik. | Duplikasi pasangan identik tidak dapat dibedakan oleh kontrak data. |
| ASM-009 | Kotak skor anotasi bersifat opsional untuk penyelesaian selama `ANOTASI_SKOR_WAJIB=false`; Yes/No tetap wajib. | Kebijakan dibentuk oleh konstanta aplikasi; belum ada konfigurasi UI. |

## Pertanyaan terbuka

| ID | Pertanyaan | Dampak |
|---|---|---|
| TODO-001 | Apakah API key yang dipakai frontend diberi kuota/rotasi atau akan dipindah ke proxy server-side sebelum penggunaan publik? | Keamanan deployment. |
| TODO-002 | Siapa pemilik operasional notebook Kaggle dan berapa lama API diharapkan tersedia per sesi? | Runbook/SLA; source hanya menunjukkan deployment sementara. |
| TODO-003 | Apakah ada target performa atau volume pengguna yang disetujui? | NFR dan kapasitas belum bisa diberi angka. |
| TODO-004 | Apakah tersedia proses resmi retensi/penghapusan data evaluasi dan persetujuan guru? | Kebijakan privasi dan tata kelola data belum diketahui. |

## Dokumen Terkait

- [PRD](./PRD.md)
- [Arsitektur](./ARCHITECTURE.md)
- [Keamanan](./SECURITY.md)
- [Risiko](./RISKS.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.1.0
