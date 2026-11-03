# Performance

## Tujuan

Mencatat batas kinerja yang terukur dari kode serta hal yang belum mempunyai target.

## Perilaku terimplementasi

- Frontend dihasilkan sebagai static bundle Vite; tabel/spreadsheet diproses client-side.
- Modul spreadsheet dimuat melalui `src/lib/xlsxLoader.ts`.
- Chat API memiliki timeout 60 detik; health check timeout 15 detik.
- Chat menerima konteks maksimal 12.000 karakter dan pertanyaan maksimal 1.000 karakter.
- UI menampilkan `processing_time_ms` dari response backend; angka tersebut mengukur waktu server yang dilaporkan API, bukan total latency browser.
- Tidak ada caching jawaban, queue server, retry otomatis, pagination API, atau metrik RUM yang ditemukan.

## Target yang belum ditetapkan

| Metrik | Status |
|---|---|
| First Contentful Paint / page load | TODO: target dan kondisi uji. |
| Throughput/concurrency backend | TODO: notebook deployment belum menetapkan SLA. |
| Ukuran maksimum file impor | TODO: tidak ditemukan batas produk lintas flow. |
| Budget bundle | TODO: belum ada gate ukuran. |

Hasil build pada mesin developer tidak menjadi target SLA.

## Dokumen Terkait

- [NFR](./NFR.md)
- [Tech stack](./TECH_STACK.md)
- [Testing](./TESTING.md)
- [API](./API.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
