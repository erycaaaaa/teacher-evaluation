# Folder Structure

## Tujuan

Menjelaskan organisasi repository saat ini; dependency/build output dikecualikan.

```text
.
├── .github/workflows/   # CI dan deployment
├── docs/                # dokumentasi
├── src/
│   ├── components/      # RubrikTable, SkorKriteriaRow, ScoreRow, ProgressBoard
│   ├── lib/             # parser, rubric/skor, blind mapping, API chat, backup, XLSX
│   │   └── __tests__/   # Vitest
│   ├── pages/           # Ruang Guru, Mode Anotasi/Evaluasi, Chatbot
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── dpo-guru.ipynb        # workflow penelitian dan backend Kaggle
├── index.html
└── package.json
```

`src/lib/rubrik.ts` menangani parse dan pembuatan sheet Rubrik; `src/lib/skor.ts` menangani impor/ekspor skor jawaban. Root juga memiliki README, CHANGELOG, CONTRIBUTING, `.env.example`, dan konfigurasi Vite/TypeScript/Tailwind. Data penelitian diproses di Kaggle dan diimpor/ekspor sebagai file.

## Dokumen Terkait

- [Arsitektur](./ARCHITECTURE.md)
- [Components](./COMPONENTS.md)
- [Installation](./INSTALLATION.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.3.0
