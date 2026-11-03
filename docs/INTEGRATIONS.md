# Integrations

## Tujuan

Mencatat komunikasi eksternal dan pertukaran file website.

## FastAPI notebook dan ngrok

- Backend: `dpo-guru.ipynb`, Langkah 22, FastAPI/Uvicorn dan tunnel pyngrok.
- Kaggle Secrets: `NGROK_AUTHTOKEN`, `CHAT_API_KEY`.
- Frontend chat memakai `VITE_API_URL`, `VITE_API_KEY`, `GET /health`, dan `POST /chat`.
- URL ngrok berubah per sesi; perbarui konfigurasi saat URL berganti.
- Tidak ada fallback jawaban lokal; error API ditampilkan apa adanya melalui pesan yang ramah.

## File lokal

| Format | Alur |
|---|---|
| XLSX | Input sheet `Feedback`, sheet `Rubrik` opsional, serta sheet `Skor` opsional; output `Feedback` + `Rubrik` dan `Skor` bila ada skor. |
| CSV | Input template anotasi `Feedback`; rubrik memakai default karena CSV tidak memiliki sheet. |
| JSON | Paket evaluasi masuk; backup/pemulihan kedua mode. |
| XLSX | Output evaluasi blind untuk dibaca ulang di Kaggle. |

File penilaian tidak dikirim ke server mana pun.

## Browser dan deployment

- `localStorage`: penyimpanan per browser/origin.
- File API, Blob, dan Object URL: baca/unduh file lokal.
- `fetch`: hanya untuk chatbot.
- GitHub Actions membangun dan mendeploy static site ke GitHub Pages.

## Dokumen Terkait

- [API](./API.md)
- [ENV](./ENV.md)
- [Deployment](./DEPLOYMENT.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
