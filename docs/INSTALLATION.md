# Installation

## Tujuan

Panduan menyiapkan frontend lokal dan menghubungkan API notebook Kaggle.

## Prasyarat

- Node.js 20 (sesuai CI; versi lokal yang tepat belum dipatok pada `.nvmrc`).
- npm dan Git.
- Notebook Kaggle dengan model serta Kaggle Secrets `NGROK_AUTHTOKEN` dan `CHAT_API_KEY` untuk backend.

## Setup lokal (PowerShell)

```powershell
git clone <URL-repository>
Set-Location <folder-repository>
npm ci
Copy-Item .env.example .env
```

Edit `.env`:

```dotenv
VITE_API_URL=https://<url-ngrok-aktif>
VITE_API_KEY=<API-key-yang-cocok-dengan-CHAT_API_KEY>
```

Jalankan:

```powershell
npm run dev
```

Vite memakai port `5173` sesuai `vite.config.ts`. Buka `http://localhost:5173`, lalu tab Chatbot PJOK. Backend harus hidup di URL aktif dan CORS harus mengizinkan origin.

## Backend Kaggle

1. Masukkan `NGROK_AUTHTOKEN` dan `CHAT_API_KEY` ke Kaggle Secrets; jangan masukkan nilainya ke notebook/commits.
2. Jalankan cell persiapan FastAPI/Uvicorn/pyngrok yang diperlukan.
3. Jalankan cell deployment Langkah 22 pada `dpo-guru.ipynb`.
4. Salin public URL yang dicetak dan perbarui `VITE_API_URL`.
5. Isi `VITE_API_KEY` dengan key yang sama dan restart dev server.

URL tunnel berubah antar sesi. Detail request pada [API](./API.md).

## Perintah dev

| Perintah | Tujuan |
|---|---|
| `npm run dev` | Vite dev server. |
| `npm test` | Vitest. |
| `npm run build` | TypeScript check dan Vite production build. |
| `npm run preview` | Preview bundle lokal. |

## Dokumen Terkait

- [Tech stack](./TECH_STACK.md)
- [ENV](./ENV.md)
- [Runbook](./RUNBOOK.md)
- [Deployment](./DEPLOYMENT.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
