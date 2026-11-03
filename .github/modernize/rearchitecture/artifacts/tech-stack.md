# Technology Stack Existing

## Bahasa, runtime, dan toolchain

- TypeScript strict; JSX React.
- React 18.3.1 dan React DOM 18.3.1.
- Vite 6.x (versi terpasang saat analisis: 6.4.5) dengan `@vitejs/plugin-react` 4.x.
- CI GitHub Actions menggunakan Node.js 20; package tidak mendeklarasikan `engines`.
- Development server Vite memakai port 5173 dan `host: true`.

## Dependensi runtime

| Paket | Rentang di manifest | Fungsi |
|---|---:|---|
| `react` | ^18.3.1 | UI |
| `react-dom` | ^18.3.1 | Render DOM |
| `lucide-react` | ^1.16.0 | Ikon |
| `xlsx` | ^0.18.5 | Import/ekspor workbook |

## Dependensi pengembangan

TypeScript ^5.7.2, Vite ^6.0.3, Vitest ^2.1.8, Tailwind CSS ^3.4.17, PostCSS ^8.4.49, Autoprefixer ^10.4.20, plugin React Vite ^4.3.4, serta tipe Node/React. Lockfile/install saat analisis memuat TypeScript 5.9.3, Vite 6.4.5, Vitest 2.1.9, Tailwind 3.4.19, dan `xlsx` 0.18.5.

## Arsitektur runtime

- SPA statis dengan routing hash internal.
- State disimpan ke Web Storage, bukan database.
- SheetJS dimuat melalui helper lazy loader.
- Klien `fetch` opsional menuju FastAPI notebook melalui ngrok; request health/chat membawa header API key jika tersedia dan tidak memakai cookie.
- CI menjalankan `npm ci`, `npx tsc --noEmit`, `npm run test`, `npm run build`; artifact `dist` diterbitkan ke GitHub Pages.

Tidak ada server-side runtime, ORM, database driver, framework routing pihak ketiga, authentication provider, atau message broker pada stack repository ini.
