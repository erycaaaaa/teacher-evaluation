# Runbook

## Tujuan

Langkah operasional developer untuk menjalankan frontend, menyalakan backend notebook, dan menangani kegagalan umum.

## Menyalakan chatbot lokal

1. Jalankan cell deployment Langkah 22 pada notebook Kaggle; pastikan Kaggle Secrets `NGROK_AUTHTOKEN` dan `CHAT_API_KEY` tersedia.
2. Salin URL ngrok terbaru dari output cell.
3. Isi `VITE_API_URL` dan `VITE_API_KEY` di `.env`.
4. Restart `npm run dev` pada terminal VS Code.
5. Buka `http://localhost:5173/#/chatbot`; cek status health.
6. Masukkan konteks materi dan pertanyaan, lalu kirim.

## Diagnosis

| Gejala | Pemeriksaan / tindakan |
|---|---|
| `API sedang offline` | Pastikan cell notebook aktif, tunnel masih ada, URL aktual benar, HTTPS URL tepat, dan origin CORS terdaftar. Coba tombol cek ulang. |
| HTTP 401 | Cocokkan `.env` `VITE_API_KEY` dengan Kaggle Secret `CHAT_API_KEY`; jangan tempel key di log/issue. Restart Vite setelah update. |
| HTTP 422 | Periksa context 1–12.000 dan pertanyaan 1–1.000 karakter serta field request. UI menampilkan pesan umum. |
| HTTP 500 | Periksa output cell/model Kaggle dan ketersediaan resource; frontend tidak membuat jawaban cadangan. |
| Timeout | Generasi dibatasi 60 detik frontend; periksa proses model/GPU dan coba ulang jika backend pulih. |
| Works local, fails on Pages | Periksa apakah build Pages menerima `VITE_API_URL`; workflow saat ini tidak menyetel variabel tersebut. Audit API key karena client bundle publik. |
| CORS dari port 5500 | Jalankan Vite di 5173 atau tambahkan `http://localhost:5500` ke allowlist notebook. |
| Ruang Guru belum punya tugas | Unduh template Feedback dari Kaggle untuk anotasi atau paket JSON validasi/final test untuk evaluasi. Website tidak menyediakan tugas contoh. |

## Quality checks

```powershell
npm test
npm run build
```

## Shutdown

Hentikan cell/kernel Kaggle sesuai kontrol notebook. Sesi/ngrok URL setelah dihentikan tidak lagi dapat dipakai. Tidak ada perintah CLI lokal untuk menghentikan notebook remote.

## Dokumen Terkait

- [Installation](./INSTALLATION.md)
- [Deployment](./DEPLOYMENT.md)
- [API](./API.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
