# Non-Functional Requirements

## Tujuan

Memisahkan batas yang terjamin oleh implementasi dari service level yang belum ditentukan.

| Kategori | Kondisi atau requirement terverifikasi | Status/risiko |
|---|---|---|
| Availability | Frontend static pada GitHub Pages; inference berjalan saat notebook dan tunnel aktif. | Backend sementara, tanpa uptime guarantee. |
| Security | API key diminta untuk `/chat`; transport ngrok HTTPS; API key frontend dapat diekstrak. | Tidak cocok untuk key privileged pada publikasi. |
| Reliability | Typecheck/unit tests di CI; error API tidak menjadi jawaban fallback. | Belum ada E2E atau retry. |
| Performance | Timeout chat 60 detik, health 15 detik. | Target latency lain TODO. |
| Data durability | localStorage dan backup file manual. | Data hilang jika browser storage dihapus; bukan penyimpanan pusat. |
| Portability | Build static; Vite server default port 5173; origin CORS dibatasi. | Browser/device support matrix TODO. |
| Accessibility | Label, status text, dan state disabled ada pada beberapa flow. | WCAG conformance belum diverifikasi. |
| Maintainability | TypeScript strict, Vitest, workflow build/test. | Tidak ada configured linter/coverage threshold. |
| Privacy | Kode guru anonim dan data evaluasi disimpan browser/file. | Retention, consent, dan data classification TODO. |

## Dokumen Terkait

- [PRD](./PRD.md)
- [Performance](./PERFORMANCE.md)
- [Security](./SECURITY.md)
- [Backup/recovery](./BACKUP_RECOVERY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
