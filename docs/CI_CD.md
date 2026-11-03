# CI/CD

## Tujuan

Menjelaskan pipeline `.github/workflows/ci-cd.yml`.

## Trigger dan stages

Trigger: push/PR ke `main` atau `master`, dan `workflow_dispatch`.

```mermaid
flowchart LR
  Trigger[Push / Pull Request / Manual] --> Quality[npm ci + tsc + npm test]
  Quality --> Build[npm ci + npm run build]
  Build --> Artifact[Upload dist Pages artifact]
  Artifact -->|push main/master saja| Deploy[Deploy GitHub Pages]
```

| Job | Needs | Steps |
|---|---|---|
| `test-and-lint` | — | Checkout, Node 20, npm cache, `npm ci`, `npx tsc --noEmit`, `npm run test`. Nama job menyebut lint, tetapi workflow tidak menjalankan linter. |
| `build` | `test-and-lint` | Checkout, Node 20, `npm ci`, `npm run build`, upload `dist` dengan `upload-pages-artifact@v3`. |
| `deploy` | `build` | Deploy dengan `actions/deploy-pages@v4` hanya pada ref `main`/`master`. |

Permissions pipeline mencakup `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`, cancel-in-progress false.

## Configuration gap

Workflow tidak menginjeksikan `VITE_API_URL` dan `VITE_API_KEY` pada step build. Maka bundle Pages tidak memiliki URL/key kecuali konfigurasi build ditambahkan. Menginjeksikan API key ke frontend tetap mengeksposnya ke pengguna akhir.

## Dokumen Terkait

- [Deployment](./DEPLOYMENT.md)
- [Testing](./TESTING.md)
- [Git workflow](./GIT_WORKFLOW.md)
- [Security](./SECURITY.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.0.0
