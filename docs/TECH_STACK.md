# Technology Stack

## Tujuan

Mencatat teknologi yang dapat diverifikasi melalui manifest, config, workflow, atau source.

## Stack

| Teknologi | Versi yang dinyatakan repo | Penggunaan | Trade-off / alternatif |
|---|---|---|---|
| React | `^18.3.1` | UI berbasis komponen. | SPA statis sederhana; alternatif seperti Vue tidak digunakan. |
| TypeScript | `^5.7.2` | Tipe untuk UI, domain, dan API client. | Build berhenti jika typecheck gagal. |
| Vite | `^6.0.3` di manifest (`npm run build` melaporkan versi terpasang) | Dev server port 5173, bundle statis. | Tidak menyediakan server-side runtime. |
| Vitest | `^2.1.8` | Unit dan contract tests. | Tidak menggantikan E2E/browser tests. |
| Tailwind CSS | `^3.4.17` | Styling dengan utility classes dan konfigurasi theme. | Komponen visual custom dalam JSX. |
| lucide-react | `^1.16.0` | Ikon. | Tidak ada library icon tambahan. |
| xlsx | `^0.18.5` | Membaca/menulis workbook evaluasi. | Pemrosesan terjadi di browser; ukuran file/memori perlu diperhatikan. |
| FastAPI | Versi runtime dideklarasikan sebagai `fastapi>=0.115,<1` di notebook | Backend `/health` dan `/chat`. | Dijalankan dalam notebook; bukan deployment permanen. |
| Uvicorn | `uvicorn[standard]>=0.30,<1` di notebook | ASGI server lokal notebook. | Tunnel publik disediakan pyngrok. |
| pyngrok | `pyngrok>=7,<9` di notebook | Membuat URL API publik sementara. | URL berubah per sesi; tunnel bukan production hosting. |
| Node.js | 20 pada GitHub Actions | Build dan test CI. | Versi lokal mengikuti environment developer. |
| GitHub Pages / Actions | Actions `checkout@v4`, `setup-node@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4` | Build/deploy static site. | Tidak menyimpan secret frontend dengan aman. |

Versi adalah range manifest, bukan pin versi patch. Versi terpasang lokal dapat berbeda dan tidak dijadikan spesifikasi runtime produksi.

## Database

Tidak ditemukan engine database, driver, ORM, migration, atau DDL. `localStorage` dan file JSON/XLSX/CSV bukan relational database.

## Dokumen Terkait

- [Instalasi](./INSTALLATION.md)
- [Arsitektur](./ARCHITECTURE.md)
- [Deployment](./DEPLOYMENT.md)
- [Testing](./TESTING.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
