# Contributing

## Tujuan

Petunjuk kontribusi untuk frontend dan dokumentasi Question Bank Guru PJOK.

## Setup dan verifikasi

Ikuti [installation guide](./docs/INSTALLATION.md), lalu sebelum membuka Pull Request jalankan:

```powershell
npm run build
npm test
git diff --check
```

## Pedoman perubahan

- Baca tipe dan helper domain sebelum mengubah perilaku.
- Pertahankan kontrak FastAPI yang tercatat dalam [API reference](./docs/API.md).
- Jangan membuat jawaban chatbot tiruan ketika API gagal.
- Tambahkan/ubah tes untuk aturan domain dan request/response API.
- Dokumentasikan perubahan perilaku yang terlihat pengguna.
- Jangan commit `.env`, Kaggle Secrets, API key, data guru, atau file dataset privat.
- Hindari mengubah file notebook/output model kecuali perubahan memang memerlukan itu dan telah ditinjau.

## Pull Request

Sertakan ringkasan, perubahan perilaku, hasil test, serta risiko/CORS/env yang perlu diperbarui. Aturan branch protection atau minimum reviewer belum dikonfigurasi di repository (**TODO**).

## Dokumen Terkait

- [Coding standard](./docs/CODING_STANDARD.md)
- [Git workflow](./docs/GIT_WORKFLOW.md)
- [Testing](./docs/TESTING.md)
- [Security](./docs/SECURITY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
