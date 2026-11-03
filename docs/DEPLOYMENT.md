# Deployment

## Tujuan

Menjelaskan deployment yang benar-benar dikonfigurasi dan urutan menjalankan backend sementara.

## Frontend

`.github/workflows/ci-cd.yml` membangun folder `dist` lalu mendeploy ke GitHub Pages pada push ke `main`/`master`. Vite memakai `base: './'`.

**Penting:** workflow yang ada tidak mengisi `VITE_API_URL` atau `VITE_API_KEY` saat build. Karena variabel Vite dikompilasi, chatbot hasil Pages tidak dapat menghubungi API kecuali build diberi config yang benar. Menambahkan API key sebagai build secret masih membuat nilainya dapat dibaca dari browser; gunakan proxy server-side sebelum memakai key sensitif di layanan publik.

## Backend

Backend berada dalam notebook Kaggle, dijalankan dengan FastAPI/Uvicorn dan diekspos melalui pyngrok. URL berubah saat sesi/tunnel baru dibuat. Konfigurasi yang diperlukan berada di Kaggle Secrets:

- `NGROK_AUTHTOKEN`
- `CHAT_API_KEY`

Jalankan cell deployment Langkah 22 pada notebook; jangan menjalankan cell sisa manual ngrok kecuali memahami efek tunnel ganda.

## Local validation

```powershell
npm ci
npm test
npm run build
npm run preview
```

Untuk API lokal, origin frontend harus cocok dengan allowlist CORS. Origin resmi yang tercantum: Pages, localhost:3000, localhost:5173. Live Server:5500 belum tercantum.

## Dokumen Terkait

- [CI/CD](./CI_CD.md)
- [Infrastructure](./INFRASTRUCTURE.md)
- [ENV](./ENV.md)
- [Runbook](./RUNBOOK.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
