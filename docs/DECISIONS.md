# Architecture Decision Records

## Tujuan

Mencatat keputusan implementasi yang terlihat dari source dan keputusan yang masih menunggu. Catatan historis tidak membuktikan bahwa keputusan pernah disetujui formal.

## ADR-001 — SPA static sebagai frontend

- **Status:** Kondisi implementasi teramati
- **Konteks:** Repo memakai React/Vite dan workflow Pages static; tidak ada server aplikasi.
- **Pilihan yang terlihat:** Build SPA lalu serve static files.
- **Konsekuensi:** Hosting sederhana; operasi API key server-side dan database tidak dapat ditempatkan di bundle.
- **Alternatif:** SSR/server app; tidak ditemukan di repo.

## ADR-002 — Persistence data penelitian lokal

- **Status:** Kondisi implementasi teramati
- **Konteks:** Evaluasi perlu disimpan di sesi guru/peneliti.
- **Pilihan yang terlihat:** `localStorage` plus JSON/XLSX/CSV untuk pertukaran.
- **Konsekuensi:** Tidak ada biaya backend state; tidak sinkron lintas device, harus backup/export.
- **Alternatif:** Database bersama; belum ada implementasi.

## ADR-003 — FastAPI notebook + ngrok untuk model inference

- **Status:** Kondisi implementasi teramati
- **Konteks:** Model dan GPU tersedia dalam workflow notebook.
- **Pilihan yang terlihat:** Jalankan FastAPI/Uvicorn dalam notebook dan expose tunnel.
- **Konsekuensi:** URL berubah dan availability bergantung sesi notebook; tidak disarankan untuk production SLA.
- **Alternatif:** Hosting service permanen; belum ditetapkan.

## ADR-004 — Strategi credential publik

- **Status:** Belum diputuskan
- **Konteks:** `VITE_API_KEY` berada di client bundle.
- **Pilihan yang perlu diputuskan:** Proxy server-side atau key terbatas dengan rotasi/rate limit.
- **Konsekuensi:** Kunci frontend saat ini tidak rahasia.
- **Owner/tanggal:** TODO.

## Format ADR untuk keputusan berikutnya

```text
## ADR-NNN — Judul
- Status: Proposed | Accepted | Superseded
- Context:
- Decision:
- Consequences:
- Alternatives:
- Owner/date:
```

## Dokumen Terkait

- [Architecture](./ARCHITECTURE.md)
- [Risks](./RISKS.md)
- [Security](./SECURITY.md)
- [Roadmap](./ROADMAP.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
