# Risks

## Tujuan

Mencatat risiko yang terlihat pada arsitektur dan operasi saat ini. Severity adalah penilaian dokumentasi awal, bukan risk acceptance resmi.

| ID | Risiko | Dampak | Mitigasi/status |
|---|---|---|---|
| RISK-001 | API key `VITE_API_KEY` masuk ke bundle publik. | Pihak lain dapat menggunakan key `/chat` dan menghabiskan resource model. | Tinggi; gunakan proxy server-side/key terbatas dan rotasi. |
| RISK-002 | Notebook/ngrok berhenti atau URL berubah. | Chat API offline. | Tinggi; jalankan notebook, perbarui URL, atau rencanakan hosting persisten. |
| RISK-003 | Workflow Pages tidak menyetel `VITE_API_URL` saat build. | Chat pada production Pages tidak memiliki endpoint default yang valid. | Tinggi; tentukan build config; key tetap bukan secret jika client-side. |
| RISK-004 | Data evaluasi hanya berada pada browser/file pengguna. | Penghapusan browser storage atau file hilang dapat menghilangkan hasil. | Tinggi; backup/export rutin dan verifikasi hasil. |
| RISK-005 | Tidak ada login/authorization untuk website. | Data browser dapat diakses oleh pengguna sesi browser/origin yang sama. | Jangan gunakan perangkat bersama tanpa membersihkan data setelah backup; kode anonim bukan autentikasi. |
| RISK-006 | CORS hanya mengizinkan origin tertentu. | Request dari port/origin lain gagal. | Rendah/operasional; gunakan 5173/3000/Pages atau perbarui allowlist. |
| RISK-007 | File impor berasal dari pengguna dan dapat besar/tidak sesuai, termasuk sheet Rubrik/Skor yang rusak atau sel formula-like. | Error parsing, penggunaan memori tinggi, data tidak valid, atau formula spreadsheet yang tidak diinginkan. | Parser Rubrik membatasi 20 baris dan 500 karakter per sel; baris skor invalid diabaikan dengan warning; Rubrik/Skor diekspor sebagai teks eksplisit. Batas ukuran file dan fuzz testing belum ditentukan. |
| RISK-008 | Tidak ada monitoring/alert uptime backend. | Gangguan diketahui setelah pengguna mencoba request. | TODO: owner dan observability. |
| RISK-009 | Kebijakan retensi/privasi data guru belum didokumentasikan. | Risiko penggunaan/penyimpanan data tidak sesuai ekspektasi. | TODO: klasifikasi, consent, retensi, akses backup. |

## Dokumen Terkait

- [Security](./SECURITY.md)
- [Roadmap](./ROADMAP.md)
- [Tasks](./TASKS.md)
- [Runbook](./RUNBOOK.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.1.0
