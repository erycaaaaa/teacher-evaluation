# Roadmap

## Tujuan

Mencatat arah yang dapat disimpulkan dari gap aktual. Ini backlog usulan, bukan jadwal atau komitmen yang telah disetujui.

## Fokus berjalan (berdasarkan implementasi)

- Menggunakan evaluasi model SFT/DPO dan alur pertukaran paket/file yang ada.
- Menghubungkan chat browser ke FastAPI notebook.
- Memelihara build/test dan static deployment.

## Kandidat tindak lanjut

| Prioritas usulan | Item | Alasan | Status |
|---|---|---|---|
| P0 untuk public launch | Lindungi `CHAT_API_KEY` di proxy server-side; jangan kirim shared secret melalui bundle client. | `VITE_*` dapat diekstrak dari browser. | TODO, belum diimplementasikan. |
| P0 untuk Pages chat | Tentukan build/deployment config `VITE_API_URL` dan strategi credential. | CI saat ini tidak menginjeksi variabel API. | TODO. |
| P1 | Definisikan durasi layanan inference non-notebook dan monitoring/alert. | ngrok/notebook bersifat sementara. | TODO. |
| P1 | Tetapkan kebijakan privasi, retensi, dan recovery data evaluasi. | localStorage dan file manual. | TODO. |
| P2 | Tambahkan browser E2E dan accessibility testing. | Saat ini hanya Vitest dan typecheck. | TODO. |

Milestone/tanggal ditentukan oleh pemilik project (**TODO**).

## Dokumen Terkait

- [Tasks](./TASKS.md)
- [Risks](./RISKS.md)
- [Decisions](./DECISIONS.md)
- [NFR](./NFR.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
