# API Reference

## Tujuan

Mencatat kontrak HTTP FastAPI pada Langkah 22 notebook `dpo-guru.ipynb`. Backend ini berbeda dari SPA statis; URL ngrok dapat berubah per sesi.

## Konvensi

- Base URL: `VITE_API_URL` dari `.env`; contoh nilai aktif bersifat sementara.
- JSON memakai snake_case untuk `max_new_tokens`, `model_stage`, `terapkan_chunking`, `model_stages`, `default_stage`, `konteks_dipakai`, `processing_time_ms`; `pertanyaan` adalah nama field kontrak.
- Endpoint inference memakai header API key. Health response tidak memuat secret.
- Timeout frontend: 60 detik untuk chat; 15 detik untuk health.

## `GET /`

Endpoint root FastAPI tersedia pada notebook untuk memeriksa status layanan.

| Properti | Nilai |
|---|---|
| Auth | Tidak tampak memerlukan API key pada handler root. |
| Request | Tanpa body. |
| Sukses/status | HTTP 200. |

```json
{
  "message": "PJOK Chatbot API aktif",
  "model_stages": ["sft", "dpo"],
  "default_stage": "sft",
  "health": "/health",
  "docs": "/docs"
}
```

Nilai `model_stages` mengikuti stage yang dimuat di notebook. UI menggunakan `/health` sebagai health check resmi.

## `GET /docs`

FastAPI menyediakan dokumentasi Swagger/OpenAPI interaktif pada `/docs`. Endpoint ini hanya ditujukan untuk eksplorasi kontrak; aksesnya mengikuti konfigurasi host/CORS notebook.

## `GET /health`

| Aspek | Kontrak |
|---|---|
| Auth | Tidak diwajibkan oleh handler health yang terdokumentasi. |
| Request | Tanpa body; frontend mengirim `ngrok-skip-browser-warning: true`. |
| Sukses | HTTP 200. |

```json
{
  "status": "ok",
  "model_stages": ["sft", "dpo"],
  "default_stage": "sft",
  "cuda": true
}
```

UI memerlukan `status === "ok"`, array `model_stages`, string `default_stage`, dan boolean `cuda`.

## `POST /chat`

### Header

| Header | Nilai |
|---|---|
| `Content-Type` | `application/json` |
| `X-API-Key` | Nilai `VITE_API_KEY`, cocok dengan `CHAT_API_KEY` pada Kaggle Secrets. |
| `ngrok-skip-browser-warning` | `true` |

### Request

| Field | Tipe | Wajib | Aturan |
|---|---|---:|---|
| `context` | string | Ya | 1–12.000 karakter. Materi yang diberikan pemakai. |
| `pertanyaan` | string | Ya | 1–1.000 karakter. Alias `message` juga diterima server, tetapi UI memakai `pertanyaan`. |
| `max_new_tokens` | integer | Tidak | 8–256; default 128. |
| `model_stage` | `"sft" \| "dpo"` | Tidak | Default backend `sft` pada notebook. |
| `terapkan_chunking` | boolean | Tidak | Default `true`; UI mengirim `true`. |

```json
{
  "context": "Materi PJOK tentang pemanasan sebelum berolahraga.",
  "pertanyaan": "Mengapa pemanasan perlu dilakukan?",
  "max_new_tokens": 128,
  "model_stage": "sft",
  "terapkan_chunking": true
}
```

### Response sukses

HTTP 200, dibaca sesuai nama field berikut:

```json
{
  "jawaban": "Jawaban yang dihasilkan model.",
  "konteks_dipakai": "Potongan materi yang dipilih server.",
  "model_stage": "sft",
  "processing_time_ms": 1234
}
```

UI hanya membentuk pesan balasan setelah keempat field memiliki tipe yang valid.

### Error

| HTTP | Makna | Perilaku frontend |
|---:|---|---|
| 401 | API key tidak valid/hilang. | “Akses ditolak, periksa API key.” |
| 422 | Validasi request FastAPI/Pydantic gagal. | Pesan umum “Pertanyaan atau konteks tidak valid.”; detail JSON tidak dipaparkan. |
| 500 | Model gagal menghasilkan jawaban. | “Model gagal menjawab, coba lagi.” |
| Jaringan/CORS | Tidak mendapat response HTTP. | Pesan koneksi; tidak menampilkan balasan bot. |
| Timeout | Lebih dari 60 detik di frontend. | Pesan timeout; tidak menampilkan balasan bot. |
| Non-200 lain / schema invalid | Request atau response tidak sesuai kontrak. | Pesan server/protokol; tidak menampilkan balasan bot. |

Contoh 422 dari FastAPI:

```json
{
  "detail": [
    {
      "loc": ["body", "context"],
      "msg": "String should have at least 1 character",
      "type": "string_too_short"
    }
  ]
}
```

Contoh format 401 dan 500 sesuai kontrak backend:

```json
{"detail": "API key tidak valid."}
```

```json
{"detail": "Model gagal menghasilkan jawaban."}
```

## CORS dan transport

Origin yang dinyatakan diizinkan: `https://erycaaaaa.github.io`, `http://localhost:3000`, `http://localhost:5173`. Live Server port `5500` belum diizinkan kecuali ditambahkan pada backend. Akses ngrok menggunakan HTTPS.

## Dokumen Terkait

- [Auth](./AUTH.md)
- [Error handling](./ERROR_HANDLING.md)
- [Integrations](./INTEGRATIONS.md)
- [ENV](./ENV.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
