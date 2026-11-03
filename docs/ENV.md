# Environment Variables

## Tujuan

Mencatat variabel yang dibaca oleh frontend dan notebook; tidak ada nilai rahasia pada dokumen.

## Frontend Vite

| Variabel | Wajib untuk | Sumber | Contoh aman |
|---|---|---|---|
| `VITE_API_URL` | API chatbot. | Vite `.env`; URL ngrok sesi aktif. | `https://<url-ngrok-aktif>` |
| `VITE_API_KEY` | `POST /chat`. | Vite `.env`; harus cocok dengan Kaggle Secret `CHAT_API_KEY`. | `<isi-lokal-jangan-commit>` |

Prefix `VITE_` membuat nilai dapat diakses kode client dan diekspos ke bundle. Mengabaikan `.env` dari Git mencegah commit tidak sengaja, tetapi **tidak** menyembunyikan API key dari pengguna situs. Jangan gunakan secret berhak istimewa dalam build publik.

`src/lib/chatConfig.ts` membaca dua nilai ini. Vite membaca ulang setelah restart dev server/build.

## Notebook Kaggle

| Secret / setting | Penggunaan |
|---|---|
| `NGROK_AUTHTOKEN` | Token autentikasi pyngrok untuk membuat tunnel. |
| `CHAT_API_KEY` | Header autentikasi endpoint `/chat`. |
| `DEPLOY_DEFAULT_STAGE` | Konfigurasi notebook; source menyetel `sft`. |
| `API_PORT` | Port lokal terpilih oleh fungsi notebook. |
| `FRONTEND_ORIGINS` | CORS origins yang diizinkan notebook; termasuk Pages dan localhost port 3000/5173. |

Tiga variabel terakhir adalah konfigurasi/runtime notebook, bukan env vars yang dibaca bundle Vite. Nilai rahasia diatur pada Kaggle Secrets.

## Template

Gunakan [.env.example](../.env.example). File hanya memuat key nama variabel dengan nilai kosong; jangan menaruh key asli di dalamnya.

## Dokumen Terkait

- [Installation](./INSTALLATION.md)
- [API](./API.md)
- [Auth](./AUTH.md)
- [Security](./SECURITY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
