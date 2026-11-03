# Authentication dan Authorization

## Tujuan

Mencatat batas autentikasi website dan API chatbot.

Website tidak memiliki login, akun guru, atau authorization pengguna. Kode Guru adalah label lokal untuk berkas hasil, bukan verifikasi identitas. Route hash hanya navigasi.

## Autentikasi API chatbot

| Endpoint | Mekanisme |
|---|---|
| `GET /health` | Health check tanpa API key sesuai handler notebook. |
| `POST /chat` | Header `X-API-Key`, dicocokkan backend dengan Kaggle Secret `CHAT_API_KEY`. |
| `GET /` | Informasi status backend; bukan mekanisme autentikasi. |

`VITE_API_KEY` dibundel ke JavaScript browser sehingga bukan secret server-side. Untuk penggunaan publik, proxy backend harus memegang credential.

## Siklus key

1. Pemilik layanan menyimpan `CHAT_API_KEY` di Kaggle Secrets.
2. Developer mengisi `VITE_API_KEY` dan `VITE_API_URL` untuk build lokal.
3. Browser mengirim key ketika memanggil `/chat`.
4. Rotasi/pencabutan dilakukan pada backend dan konfigurasi frontend terkait diperbarui.

Tidak ada bearer token, session cookie, user account, atau permission service.

## Dokumen Terkait

- [API](./API.md)
- [Keamanan](./SECURITY.md)
- [ENV](./ENV.md)
- [Integrations](./INTEGRATIONS.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.1.0
