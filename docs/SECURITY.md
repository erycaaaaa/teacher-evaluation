# Security

## Tujuan

Merangkum kontrol yang ada dan gap keamanan yang perlu keputusan. Ini bukan sertifikasi atau hasil pentest.

## OWASP Top 10 checklist (2021)

| Risiko | Kondisi dari source | Tindak lanjut |
|---|---|---|
| A01 Broken Access Control | Tidak ada login/otorisasi pengguna; hash route hanya navigasi. API key hanya mengamankan endpoint chat. | Jangan gunakan browser bersama tanpa mengamankan data lokal; kode guru bukan kontrol akses. |
| A02 Cryptographic Failures | Ngrok HTTPS; key server disimpan Kaggle Secrets; API key `VITE_*` terekspos dalam bundle. | **Prioritas:** gunakan proxy server-side untuk deployment publik; rotasi key bila terpapar. |
| A03 Injection | React merender text sebagai teks; tidak ditemukan SQL karena tidak ada DB. Sheet ekspor Rubrik/Skor memakai sel bertipe teks eksplisit, termasuk nilai berawalan `=`, `+`, `-`, atau `@`. | Tetap hindari raw HTML; parser Rubrik membatasi maksimal 20 baris dan 500 karakter per sel; parser Skor mengabaikan baris invalid dengan peringatan. |
| A04 Insecure Design | Backend notebook/ngrok sementara; API key browser bukan secret; tidak ada threat model formal. | Batasi penggunaan pada alur penelitian terkontrol; rancang proxy dan rate limit untuk penggunaan publik. |
| A05 Security Misconfiguration | CORS diatur di notebook; origin yang tercatat hanya Pages dan localhost 3000/5173. | Jangan gunakan wildcard; tambahkan origin hanya yang diperlukan. |
| A06 Vulnerable and Outdated Components | Manifest dan lock file tersedia; workflow tidak menjalankan audit dependency. | Tambahkan pemeriksaan advisory melalui proses dependency management terpisah. |
| A07 Identification and Authentication Failures | Tidak ada user auth; `/chat` memeriksa `X-API-Key`. | API key bersifat shared dan bukan identitas pengguna. |
| A08 Software and Data Integrity Failures | Paket file divalidasi; CI menggunakan npm lockfile dan `npm ci`. | Pertimbangkan review/protection branch serta provenance dependency. |
| A09 Security Logging and Monitoring Failures | Tidak ada telemetry/error tracking terpusat. | TODO: tetapkan logging/alert backend tanpa menyimpan API key atau isi materi sensitif. |
| A10 SSRF | Frontend memakai base URL dari build config; tidak ada endpoint proxy server-side. | Server-side proxy baru harus membatasi destination URL. |

## Data dan secrets

- Jangan commit `.env`, Kaggle Secrets, atau dataset/hasil penilaian privat.
- `.env.example` harus tetap kosong/non-secret.
- `VITE_API_KEY` terlihat client-side. Git ignore mencegah commit lokal, bukan ekspos di deployment.
- Backup mengecualikan key yang namanya mengandung indikasi credential; jangan menganggap itu sebagai sanitasi isi seluruh value.
- Hindari mencatat request chat lengkap atau API key.
- Data teks dari Rubrik dan Skor diekspor sebagai string XLSX, bukan formula; nilai anotasi `Feedback` tetap mengikuti kontrak workbook sebelumnya.

## Dokumen Terkait

- [Auth](./AUTH.md)
- [ENV](./ENV.md)
- [API](./API.md)
- [Risks](./RISKS.md)
- [Contributing](../CONTRIBUTING.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.1.0
