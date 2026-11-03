# UI Guidelines

## Tujuan

Mendeskripsikan konvensi visual yang sudah dipakai; bukan membuat design system baru.

## Pola visual aktual

- Utility CSS dari Tailwind v3 dan token custom di `tailwind.config.js`/`src/index.css`.
- Warna semantik dipakai melalui kelas seperti `bg-pri`, `text-tx`, `border-bd`, `text-mute`, `bg-danger-bg`.
- Komponen umum memakai radius `rounded-card`/`rounded-btn`, border tipis, latar putih, dan shadow ringan.
- Layout responsif memakai breakpoint Tailwind (`sm`, `md`) dan container maksimum sekitar 1200 px pada shell.
- Ikon berasal dari `lucide-react`.
- Bahasa UI Bahasa Indonesia; field teknis/API mempertahankan nama kontrak.
- Status penting disampaikan melalui teks/icon, tidak hanya warna; gunakan `role="alert"`/`role="status"` dan label form bila sesuai.

## Chat UI

- Materi dan pertanyaan diketik pengguna; tidak ada pertanyaan contoh yang dikirim otomatis.
- Health status ditampilkan di header dan kondisi offline menonaktifkan tombol.
- Loading state menampilkan teks “sedang menjawab...”.
- Pesan error tidak disamarkan sebagai balasan model.

## Aksesibilitas dan perubahan

- Hubungkan label input dengan `htmlFor`/`id`, sediakan aria-label untuk kontrol tanpa teks, dan pastikan state disabled terlihat.
- Gunakan semantic button/form; hindari elemen interaktif non-button.
- Pertahankan token dan pola kelas existing sebelum menambah warna/komponen baru.
- Target WCAG conformance formal belum diuji (**TODO**).

## Dokumen Terkait

- [Components](./COMPONENTS.md)
- [Sitemap](./SITEMAP.md)
- [State management](./STATE_MANAGEMENT.md)
- [Testing](./TESTING.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
