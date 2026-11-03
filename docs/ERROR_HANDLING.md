# Error Handling

## Tujuan

Menetapkan perilaku nyata dan pesan pengguna untuk validasi lokal serta kegagalan integrasi.

## Chat API

| Kondisi | Klasifikasi | Pesan UI | Balasan bot? |
|---|---|---|---:|
| HTTP 401 | `auth` | Akses ditolak, periksa API key. | Tidak |
| HTTP 422 | `validation` | Pertanyaan atau konteks tidak valid. | Tidak |
| HTTP 500 | `server` | Model gagal menjawab, coba lagi. | Tidak |
| Timeout chat | `timeout` | Server tidak merespons dalam 60 detik. Silakan coba lagi. | Tidak |
| Fetch gagal/CORS | `network` | Server tidak dapat dihubungi. Pastikan API aktif. | Tidak |
| Payload sukses tidak sesuai tipe | `protocol` | Respons API tidak valid. | Tidak |
| HTTP error lain | `server` | Server gagal memproses permintaan / status request gagal. | Tidak |

UI memvalidasi `context` dan `pertanyaan` sebelum fetch dan tidak menampilkan body error detail (termasuk array Pydantic) kepada pengguna.

## Health check

Health check gagal atau tidak valid → banner **API sedang offline**, tombol kirim dinonaktifkan. Pengguna dapat memeriksa ulang. Error bukan diubah menjadi jawaban fallback.

## Error lokal data / file

Import paket/evaluasi memeriksa struktur dan menampilkan pesan kegagalan pada UI. Backup restore mengembalikan hasil status/gagal jika JSON invalid. Error pemuatan localStorage siklus dicatat ke console dan state awal dibuat oleh helper; perilaku ini tidak berlaku pada jawaban chatbot.

## Logging

Tidak ada central logging, telemetry, error tracking, atau persistence server pada frontend. Jangan menulis API key, body materi pengguna, atau informasi sensitif ke console. TODO: sepakati logging operasional backend dan retensi sebelum penggunaan publik.

## Dokumen Terkait

- [API](./API.md)
- [Security](./SECURITY.md)
- [Monitoring](./MONITORING.md)
- [Runbook](./RUNBOOK.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
