# Coding Standard

## Tujuan

Merangkum pola yang ada dan pemeriksaan otomatis; aturan tambahan ditandai sebagai rekomendasi.

## Konvensi source

- React pages/components menggunakan `.tsx`; domain/API menggunakan `.ts`.
- TypeScript strict aktif; `noUnusedLocals` dan `noUnusedParameters` aktif.
- Domain fields mengikuti tipe `src/types/index.ts`; kontrak API JSON dipertahankan sesuai nama backend.
- Komponen mengikuti function component, React hooks, dan ekspor bernama yang sudah digunakan.
- Gaya menggunakan Tailwind classes dan token tema custom; minimalkan CSS inline selain nilai dinamis.
- UI berbahasa Indonesia; pertahankan label bahasa dan istilah API yang tepat.
- Hindari menyimpan API key ke `localStorage`, file ekspor, test snapshot, atau log.

## Validasi

```powershell
npm run build
npm test
git diff --check
```

Tidak ditemukan konfigurasi ESLint/Prettier pada manifest; jangan menyebut lint command sebagai gate yang tersedia.

## Rekomendasi untuk kontribusi

- Pertahankan perubahan kecil dan terfokus.
- Tambahkan unit/contract test saat mengubah parser, aturan domain, atau API.
- Untuk perubahan API, jangan mengganti field snake_case kontrak atau memunculkan success-shaped fallback.
- Cek `git diff` sebelum commit dan jangan commit `.env`.

## Dokumen Terkait

- [Testing](./TESTING.md)
- [Git workflow](./GIT_WORKFLOW.md)
- [Security](./SECURITY.md)
- [ENV](./ENV.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
