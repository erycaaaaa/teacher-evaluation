# Git Workflow

## Tujuan

Mencatat workflow yang terverifikasi dan rekomendasi kontribusi minimum.

## Branch dan automation

Workflow `.github/workflows/ci-cd.yml` dipicu pada push dan pull request ke `main`/`master`, serta `workflow_dispatch`. CI menjalankan `npm ci`, `npx tsc --noEmit`, `npm run test`, dan production build. Deploy Pages berjalan pada push ke `main`/`master`.

## Alur kontribusi yang disarankan

1. Buat branch untuk perubahan terisolasi.
2. Jalankan build dan tes yang relevan.
3. Periksa diff dan pastikan secret/data sensitif tidak ditambahkan.
4. Buka Pull Request; pastikan workflow CI sukses.
5. Merge melalui proses repository.

Nama branch, format commit, keharusan review, dan aturan perlindungan branch belum ditetapkan di source (**TODO**).

## Dokumen Terkait

- [CONTRIBUTING](../CONTRIBUTING.md)
- [Testing](./TESTING.md)
- [CI/CD](./CI_CD.md)
- [Security](./SECURITY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
