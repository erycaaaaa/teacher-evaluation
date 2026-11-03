# Monitoring

## Tujuan

Membedakan status check yang tersedia dengan observability yang belum dibangun.

## Mekanisme saat ini

- Chat page memanggil `GET /health` saat dimuat dan dapat meminta check ulang.
- Health response memuat `status`, `model_stages`, `default_stage`, dan `cuda`.
- Chat response memuat `processing_time_ms`; UI menampilkannya setelah sukses.
- GitHub Actions menampilkan hasil build dan test.
- Backend notebook mencetak URL/tunnel/status runtime dalam output cell.

## Tidak tersedia

Tidak ditemukan metrics dashboard, uptime monitor, alerting, centralized logs, tracing, crash reporting, atau retention policy. Health check pada UI adalah diagnostik interaktif, bukan monitoring uptime eksternal.

## Operasional yang disarankan (belum dikonfigurasi)

- Pantau kesiapan notebook dan tunnel dari operator.
- Jangan merekam API key atau materi/pertanyaan pengguna dalam log.
- TODO: tentukan retensi dan alert jika API dibuka untuk penggunaan berkelanjutan.

## Dokumen Terkait

- [API](./API.md)
- [Error handling](./ERROR_HANDLING.md)
- [Runbook](./RUNBOOK.md)
- [NFR](./NFR.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
