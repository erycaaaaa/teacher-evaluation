# PROMPT PERBAIKAN WEBSITE — Question Bank Guru PJOK (React 18 + Vite + TS + Tailwind), versi 2

Kamu adalah engineer yang memperbaiki aplikasi web statis **Question Bank Guru PJOK** (repo `guru-v1`, Zero-Backend SPA, Hash Router `#/admin` dan `#/guru`, Vitest 38 tes, deploy GitHub Pages). Aplikasi ini mengevaluasi model **SFT vs SFT+DPO** dari notebook Kaggle skripsi. Hasil audit menemukan ketidakcocokan antara website dan notebook. Perbaiki sesuai urutan di bawah.

## Sumber kebenaran
Kontrak data dan API mengikuti notebook `dpo-guru_revisi_humanis.ipynb` (Langkah 15–22). Bila dokumen ini bertentangan dengan kode notebook, **notebook yang benar**; catat pertentangannya di laporan akhir dan jangan menebak. Perubahan v2 dibanding v1: nama berkas validasi disamakan, impor `final_test_log.json` dan `dpo_eos_check.json`, guard kebocoran untuk data feedback DPO, pembacaan `model_stages` dari `/health`, pemeriksaan `MANIFEST.json`, dan tugas baru (Tugas 10) untuk tes kontrak terhadap format ekspor notebook.

## Aturan kerja (wajib)
1. **Baca dulu, ubah kemudian.** Baca `src/lib/*.ts`, `src/components/LiveGeneratorModal.tsx`, `src/pages/AdminPage.tsx`, `src/types/index.ts`, `.github/workflows/ci-cd.yml`. Tulis ringkasan temuan (maks. 15 baris) SEBELUM mengedit.
2. **Jangan ubah kontrak data yang sudah baku:** 27 kolom `Evaluasi_Guru`, 6 kolom `Feedback`, skema `paket_tugas_guru.json` v2, fungsi `normalizeAnswer`, dan algoritma FNV-1a di `blind.ts`. Semua tes lama harus tetap lulus.
3. **Tidak ada rahasia di kode.** Tidak ada URL ngrok atau API key bawaan. API key hanya di memori (state React), tidak masuk `localStorage`, ekspor `.xlsx`, ekspor JSON, atau log konsol.
4. Setelah tiap tugas: jalankan `npx tsc --noEmit` dan `npm run test`. Di akhir jalankan juga `npm run build`. Jangan menyatakan selesai kalau salah satunya gagal.
5. Jangan menambah dependensi baru kecuali benar-benar perlu. Sebutkan alasannya kalau menambah.
6. Teks UI, pesan galat, dan dokumentasi ditulis dalam Bahasa Indonesia yang wajar dan ringkas, tanpa jargon berlebihan dan tanpa kalimat yang menyebut proses internal ("sesuai audit", "permintaan penguji").

---

## TUGAS 1 — Buat / ganti `src/lib/api.ts` (prioritas tertinggi)

### Masalah
Notebook (FastAPI, Langkah 22) menerima body `/chat` dengan field **`pertanyaan`**, tetapi dokumentasi website menulis field **`message`**. Itu menyebabkan error **422**. Selain itu `kelas` tidak dikenali server.

### Kontrak API notebook (sumber kebenaran)

| Endpoint | Method | Header | Keterangan |
|---|---|---|---|
| `/health` | GET | `X-API-Key`, `ngrok-skip-browser-warning: true` | Respons: `{status, model_stages, cuda}` |
| `/chat` | POST | `Content-Type: application/json`, `X-API-Key`, `ngrok-skip-browser-warning: true` | Body & respons di bawah |

Body `/chat`:
```json
{
  "context": "string, 1–12000 karakter",
  "pertanyaan": "string, 1–1000 karakter",
  "max_new_tokens": 128,
  "model_stage": "sft | dpo",
  "terapkan_chunking": true
}
```
Respons: `{ "jawaban": string, "konteks_dipakai": string, "model_stage": "sft"|"dpo", "processing_time_ms": number }`.
Batas: `max_new_tokens` 8–256. Error: 401 (API key), 422 (format), 500 (model gagal).
Server memakai `inference_lock`, jadi **permintaan harus serial** (jangan `Promise.all`).

Catatan tambahan dari kode notebook (Langkah 22):
- CORS server memakai `allow_credentials=False`; jadi `fetch` memakai `credentials: 'omit'` dan **tidak** mengirim cookie.
- `/health` mengembalikan `model_stages` (daftar tahap yang benar-benar termuat, mis. `["sft"]` atau `["sft","dpo"]`). Bila `dpo` tidak ada di daftar itu, UI **menonaktifkan** pilihan DPO dan `generatePair`, dengan penjelasan singkat, bukan menunggu error dari `/chat`.
- Generasi memakai `do_sample=False` (deterministik). Jawaban SFT dan DPO sering **identik** (di final test ±99%); UI menampilkan lencana "Identik" dan menjelaskan bahwa ini hasil yang wajar, bukan galat.
- ngrok versi gratis membatasi jumlah permintaan per menit; pertahankan `SERIAL_DELAY_MS` dan jangan menambah polling otomatis.

### Implementasi rujukan (sudah lolos `tsc --strict`; boleh disesuaikan dengan gaya repo, tapi perilakunya harus sama)

Jika `api.ts` lama sudah ada dan komponen lain mengimpor nama tertentu (mis. dari `LiveGeneratorModal.tsx`), **pertahankan nama ekspor lama** sebagai alias/wrapper tipis agar tidak merusak komponen, lalu migrasikan pemanggilnya.

```ts
// src/lib/api.ts — klien HTTP untuk API FastAPI + ngrok di notebook Kaggle (Langkah 22).
// Kontrak mengikuti ChatRequest/ChatResponse di notebook. API key HANYA di memori.
import { isIdenticalAnswer } from './normalize';

export type ModelStage = 'sft' | 'dpo';

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

/** Sengaja kosong: tidak ada URL atau key bawaan di kode sumber. */
export const DEFAULT_API_CONFIG: ApiConfig = { baseUrl: '', apiKey: '' };

export const LIMITS = {
  contextMax: 12_000,
  pertanyaanMax: 1_000,
  maxNewTokensMin: 8,
  maxNewTokensMax: 256,
  maxNewTokensDefault: 128,
} as const;

export const REQUEST_TIMEOUT_MS = 120_000;
export const SERIAL_DELAY_MS = 150;

export interface ChatParams {
  context: string;
  pertanyaan: string;
  modelStage: ModelStage;
  maxNewTokens?: number;
  terapkanChunking?: boolean;
  signal?: AbortSignal;
}

export interface ChatResult {
  jawaban: string;
  konteksDipakai: string;
  modelStage: ModelStage;
  processingTimeMs: number;
}

export interface HealthResult {
  status: string;
  modelStages: string[];
  cuda: boolean;
}

export interface PairResult {
  sft: ChatResult;
  dpo: ChatResult;
  identik: boolean;
}

export type ApiErrorKind =
  | 'config'
  | 'network'
  | 'auth'
  | 'validation'
  | 'server'
  | 'timeout'
  | 'aborted'
  | 'protocol';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** Rapikan URL ngrok: trim, buang slash akhir dan sufiks /chat|/health|/docs, wajib https (kecuali localhost). */
export function normalizeBaseUrl(raw: string): string {
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '').replace(/\/(chat|health|docs)$/i, '');
  if (!trimmed) throw new ApiError('config', 'URL API belum diisi.');
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ApiError('config', 'URL API tidak valid. Salin URL ngrok lengkap, contoh: https://xxxx.ngrok-free.app');
  }
  const lokal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !lokal) {
    throw new ApiError('config', 'URL API harus memakai https:// (halaman GitHub Pages memblokir http).');
  }
  return url.origin + url.pathname.replace(/\/+$/, '');
}

export function buildHeaders(cfg: ApiConfig, json: boolean): Record<string, string> {
  const headers: Record<string, string> = { 'ngrok-skip-browser-warning': 'true' };
  if (json) headers['Content-Type'] = 'application/json';
  const key = (cfg.apiKey ?? '').trim();
  if (key) headers['X-API-Key'] = key;
  return headers;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function toHttpError(res: Response): Promise<ApiError> {
  let detail = '';
  try {
    const data = (await res.json()) as { detail?: unknown };
    detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail ?? data);
  } catch {
    /* body bukan JSON */
  }
  if (res.status === 401) return new ApiError('auth', 'API key salah atau belum diisi.', 401);
  if (res.status === 422) {
    return new ApiError('validation', `Format permintaan ditolak server (422). ${detail}`.trim(), 422);
  }
  if (res.status >= 500) return new ApiError('server', `Server model gagal menjawab (${res.status}). ${detail}`.trim(), res.status);
  return new ApiError('server', `Permintaan gagal (${res.status}). ${detail}`.trim(), res.status);
}

interface RequestInitLite {
  method: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function request<T>(cfg: ApiConfig, path: string, init: RequestInitLite): Promise<T> {
  const base = normalizeBaseUrl(cfg.baseUrl);
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, init.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  init.signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const res = await fetch(base + path, {
      method: init.method,
      headers: buildHeaders(cfg, init.body !== undefined),
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
      credentials: 'omit', // server memakai allow_credentials=False
      mode: 'cors',
    });
    if (!res.ok) throw await toHttpError(res);
    try {
      return (await res.json()) as T;
    } catch {
      throw new ApiError(
        'protocol',
        'Respons server bukan JSON. Kemungkinan halaman peringatan ngrok atau URL salah.',
      );
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw timedOut
        ? new ApiError('timeout', 'Server terlalu lama menjawab (timeout).')
        : new ApiError('aborted', 'Permintaan dibatalkan.');
    }
    throw new ApiError(
      'network',
      'Tidak dapat terhubung ke API. Periksa: (1) notebook Kaggle masih berjalan, (2) URL ngrok terbaru, ' +
        '(3) origin website sudah ada di FRONTEND_ORIGINS (CORS) pada notebook.',
    );
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', onAbort);
  }
}

/** Antrian serial: hanya satu permintaan berjalan pada satu waktu + jeda antar-permintaan. */
let chain: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task);
  chain = run.then(
    () => sleep(SERIAL_DELAY_MS),
    () => sleep(SERIAL_DELAY_MS),
  );
  return run;
}

export function checkHealth(cfg: ApiConfig, signal?: AbortSignal): Promise<HealthResult> {
  return enqueue(async () => {
    const raw = await request<{ status?: string; model_stages?: string[]; cuda?: boolean }>(cfg, '/health', {
      method: 'GET',
      signal,
      timeoutMs: 15_000,
    });
    return {
      status: String(raw.status ?? 'unknown'),
      modelStages: Array.isArray(raw.model_stages) ? raw.model_stages : [],
      cuda: Boolean(raw.cuda),
    };
  });
}

export function chat(cfg: ApiConfig, params: ChatParams): Promise<ChatResult> {
  const context = params.context.trim();
  const pertanyaan = params.pertanyaan.trim();
  if (!context) return Promise.reject(new ApiError('validation', 'Context tidak boleh kosong.'));
  if (!pertanyaan) return Promise.reject(new ApiError('validation', 'Pertanyaan tidak boleh kosong.'));
  if (context.length > LIMITS.contextMax) {
    return Promise.reject(new ApiError('validation', `Context maksimal ${LIMITS.contextMax} karakter.`));
  }
  if (pertanyaan.length > LIMITS.pertanyaanMax) {
    return Promise.reject(new ApiError('validation', `Pertanyaan maksimal ${LIMITS.pertanyaanMax} karakter.`));
  }
  const maxNew = Math.min(
    LIMITS.maxNewTokensMax,
    Math.max(LIMITS.maxNewTokensMin, Math.round(params.maxNewTokens ?? LIMITS.maxNewTokensDefault)),
  );

  return enqueue(async () => {
    // Nama field mengikuti ChatRequest notebook: `pertanyaan` (BUKAN `message`).
    const raw = await request<{
      jawaban?: unknown;
      konteks_dipakai?: unknown;
      model_stage?: unknown;
      processing_time_ms?: unknown;
    }>(cfg, '/chat', {
      method: 'POST',
      signal: params.signal,
      body: {
        context,
        pertanyaan,
        max_new_tokens: maxNew,
        model_stage: params.modelStage,
        terapkan_chunking: params.terapkanChunking ?? true,
      },
    });
    if (typeof raw.jawaban !== 'string') {
      throw new ApiError('protocol', 'Respons /chat tidak memuat field "jawaban".');
    }
    return {
      jawaban: raw.jawaban.trim(),
      konteksDipakai: typeof raw.konteks_dipakai === 'string' ? raw.konteks_dipakai : context,
      modelStage: raw.model_stage === 'sft' || raw.model_stage === 'dpo' ? raw.model_stage : params.modelStage,
      processingTimeMs: typeof raw.processing_time_ms === 'number' ? raw.processing_time_ms : 0,
    };
  });
}

/** Generate pasangan SFT lalu DPO untuk pertanyaan yang sama (serial, tidak paralel). */
export async function generatePair(
  cfg: ApiConfig,
  params: Omit<ChatParams, 'modelStage'>,
  onProgress?: (tahap: ModelStage) => void,
): Promise<PairResult> {
  onProgress?.('sft');
  const sft = await chat(cfg, { ...params, modelStage: 'sft' });
  onProgress?.('dpo');
  const dpo = await chat(cfg, { ...params, modelStage: 'dpo' });
  return { sft, dpo, identik: isIdenticalAnswer(sft.jawaban, dpo.jawaban) };
}
```

### Perubahan yang menyertai
- `LiveGeneratorModal.tsx`: ganti pemanggilan lama dengan `checkHealth`, `generatePair`. Tampilkan pesan `ApiError.message` apa adanya, dan tunjukkan tahap berjalan lewat `onProgress` ("Menghasilkan jawaban SFT…" lalu "…DPO"). Tambah tombol **Batalkan** (AbortController). Field `kelas` tetap dipakai untuk metadata tugas di sisi website, **tidak dikirim** ke server.
- Muat `/health` saat tombol "Uji koneksi" ditekan dan simpan `modelStages` di state; nonaktifkan opsi DPO bila tidak tersedia (lihat catatan di atas).
- Input API key: `type="password"`, tidak di-persist. Tampilkan catatan: "URL ngrok berubah tiap sesi Kaggle; tempel ulang setiap notebook dijalankan."
- Tambah petunjuk di UI untuk error `network`: cek notebook masih berjalan, URL terbaru, dan origin GitHub Pages sudah ada di `FRONTEND_ORIGINS` notebook.

### Tes baru `src/lib/__tests__/api.test.ts` (mock `fetch` dengan `vi.fn`)
1. Body `/chat` memuat tepat field: `context`, `pertanyaan`, `max_new_tokens`, `model_stage`, `terapkan_chunking`; **tidak** ada `message` dan `kelas`.
2. Header memuat `X-API-Key` dan `ngrok-skip-browser-warning: true`; tanpa key, `X-API-Key` tidak dikirim.
3. `generatePair` memanggil `sft` dulu, baru `dpo`, dan tidak pernah dua `fetch` berjalan bersamaan (lacak counter in-flight).
4. Pemetaan error: 401→`auth`, 422→`validation`, 500→`server`, `fetch` melempar TypeError→`network`, abort→`aborted`, timeout (fake timers)→`timeout`, respons non-JSON→`protocol`.
5. `normalizeBaseUrl`: trim, buang slash akhir, buang `/chat`, tolak `http://` non-localhost, tolak string kosong.
6. Validasi panjang `context` > 12000 dan `pertanyaan` > 1000 ditolak sebelum `fetch`.
7. Key tidak pernah ditulis ke `localStorage`/`sessionStorage` (spy `Storage.prototype.setItem`).
8. `maxNewTokens` di-clamp ke 8–256.
9. `fetch` dipanggil dengan `credentials: 'omit'`.
10. Bila `/health` tidak memuat `dpo` pada `model_stages`, `generatePair` ditolak dengan `ApiError('config', ...)` sebelum `/chat` dipanggil (atau pemanggil memeriksanya lebih dulu; pilih satu dan tes).

---

## TUGAS 2 — Guard kebocoran konsisten (`src/lib/paket.ts`)
Dua dokumen internal tidak sepakat (satu hanya `train.csv`, satu lagi train/val/test). Tetapkan satu aturan dan implementasikan:
- `set = 'final_test'`: tolak impor jika ada ID yang beririsan dengan `train.csv` **atau** `val.csv` (jika diunggah).
- `set = 'validasi'`: tolak jika beririsan dengan `train.csv` **atau** `test.csv` (jika diunggah).
- Pesan galat menyebut jumlah ID bocor dan 5 contoh ID. Tambah tes untuk keempat kombinasi.
- **Data feedback untuk DPO** (modul Anotasi): notebook hanya menerima feedback dari **train split**; ID dari `val.csv` atau `test.csv` membuat notebook berhenti. Terapkan aturan yang sama di website: bila `train.csv` diunggah, tolak berkas anotasi/feedback yang memuat ID di luar train, dengan pesan jumlah dan 5 contoh ID. Tes untuk kasus ini.
- Berkas feedback yang diekspor website untuk dibaca notebook (Langkah 16) harus memakai sheet bernama persis **`Feedback`**, kolom wajib `id, pertanyaan, jawaban, status`, dan nilai `status` hanya `Yes` atau `No` (huruf kapital di awal). Tambahkan tes kontrak untuk itu.
- Perbarui dokumentasi agar satu aturan ini saja yang tertulis.

## TUGAS 3 — Modul C menerima keluaran validasi DPO (`paket.ts`, `AdminPage.tsx`)
Notebook (Langkah 20b) mengekspor `sft_merged_validation_details.csv` dan `dpo_validation_details.csv` ke folder `evaluation_details/` (skema kolom **sama** dengan CSV final test: `id, pertanyaan, candidate, reference` wajib; `kelas, context_col, split` opsional; `split` bila ada harus `"validation"`).
- Impor harus menerima nama berkas dari notebook di atas. Boleh juga menerima `sft_validation_details.csv` sebagai alias bila peneliti mengganti namanya, tetapi nama dari notebook adalah yang utama dan harus ada di tes.
- Modul C harus bisa mengimpor kedua file itu, membuat paket `set: 'validasi'`, lalu diuji lewat Gerbang Validasi yang sudah ada.
- Validasi: jumlah baris dan urutan `id` sama di kedua file, `reference` identik per baris.
- Tambah tes untuk impor valid dan tiga kasus galat (urutan beda, reference beda, `split` salah).

## TUGAS 4 — Protokol final test (`siklus.ts`, Modul D)
Dalam penelitian ini final test sempat dijalankan di notebook sebelum gerbang validasi (Modul C) dilalui.
- Buka kunci Modul D normalnya hanya jika Modul C lolos. Tambahkan jalur **"Override protokol"**: peneliti mencentang konfirmasi dan mengisi alasan (wajib, min. 20 karakter).
- Impor opsional **`final_test_log.json`** dari notebook (struktur: `{"versi":1,"eksekusi":[{"eksekusi_ke","run_tag","waktu_mulai","status","pernyataan",...}]}`). Tampilkan jumlah eksekusi final test dan batas protokol (maksimal 2). Bila jumlah eksekusi ≥ 2, tampilkan peringatan bahwa eksekusi lagi tidak diizinkan protokol; setiap eksekusi masuk sebagai baris `Peristiwa = "Eksekusi final test"` di `Catatan_Protokol`.
- Simpan override di riwayat siklus (waktu, alasan) dan tampilkan di `Rekap`: sheet baru **`Catatan_Protokol`** (kolom: `Waktu, Siklus, Peristiwa, Alasan`). Sheet lama tidak boleh berubah.
- Tes: tanpa lolos Modul C dan tanpa override → terkunci; dengan override valid → terbuka dan tercatat; alasan < 20 karakter → ditolak.

## TUGAS 5 — Satuan gerbang preferensi (`anotasi.ts`, `siklus.ts`, `TabSiklus.tsx`)
Notebook menghitung **grup pertanyaan** yang punya minimal 1 jawaban Yes dan 1 No (`MIN_GRUP_PREFERENSI_TEKNIS = 6`, `REKOMENDASI_GRUP_PREFERENSI = 20`), sedangkan UI menyebut "pasangan valid".
- Tampilkan **dua angka berlabel jelas**: "Grup pertanyaan berpreferensi" (dipakai untuk gerbang) dan "Total pasangan Yes×No".
- Ambang 6 / 20 / 50–150 berlaku untuk **grup pertanyaan**. Perbarui teks UI, tooltip, dan dokumentasi.
- Tes: 1 pertanyaan dengan 2 Yes dan 3 No = 1 grup, 6 pasangan.

## TUGAS 6 — Checklist EOS Modul B benar-benar memverifikasi
Cek `<|im_end|>` di notebook pernah terlewati diam-diam. Ubah checklist item "EOS ganda" agar **tidak bisa dicentang** sebelum peneliti memberi hasil cek dari notebook. Ada dua cara input, pilih salah satu di UI:
  - **Impor `dpo_eos_check.json`** (format dari notebook: objek dengan kunci nama kolom, mis. `chosen_ids` dan `rejected_ids`, masing-masing `{"ganda": int, "hilang": int, "n": int}`; nama kolom bisa `chosen_input_ids`/`rejected_input_ids` pada versi TRL lain). Website menjumlahkan `ganda` dan `hilang` seluruh kolom.
  - **Isi manual** empat angka input number: `ganda` dan `hilang` untuk chosen, lalu untuk rejected.
  Item hanya bisa dicentang bila total `ganda = 0` dan total `hilang = 0`. Jika `ganda > 0` atau `hilang > 0`, tampilkan peringatan merah dengan petunjuk: set `DPO_AKHIRAN_EOS = ""` lalu jalankan ulang Langkah 16–20. Simpan nilai itu di riwayat siklus dan ekspor di `Catatan_Protokol`.

## TUGAS 7 — Kesepakatan antar-guru: tambah kappa (`aggregate.ts`)
Pertahankan persen kesepakatan mentah (label "bukan kappa"). Tambahkan di sampingnya:
- **Cohen's κ** bila semua tugas dinilai tepat 2 guru yang sama.
- **Fleiss' κ** bila ≥3 guru atau jumlah penilai per tugas bervariasi (hanya tugas dengan jumlah penilai sama yang diikutkan; tampilkan jumlah tugas yang dipakai).
- Kategori = 4 nilai `Keputusan`. Tampilkan `n/a` bila variansi nol atau data kurang, jangan `NaN`.
- Tes dengan contoh hitungan tangan (sertakan perhitungannya di komentar tes) dan kasus tepi.
- Tampilkan di dashboard dan sheet `Per_Guru`/ringkasan **tanpa mengubah** urutan 27 kolom.

## TUGAS 8 — Pengaman data (`localStorage` bisa hilang)
- Tambah tombol **"Cadangkan semua data (.json)"** dan **"Pulihkan dari cadangan"** di Admin dan Guru. Isi cadangan: penilaian, anotasi, siklus, paket tugas. **Tidak** memuat API key.
- Banner pengingat di halaman Guru: "Data tersimpan di browser ini. Ekspor `.xlsx` setelah selesai sesi; jangan hapus data browser."
- Tes round-trip: cadangkan → kosongkan → pulihkan → data sama; file cadangan tidak mengandung string key.

## TUGAS 9 — Dokumentasi dan CI
- Perbaiki diagram Mermaid di dokumen Waterfall: `stroke:#2px` tidak valid → `stroke-width:2px` (fase 2–6).
- Hapus "Smoke Test URL" dari diagram CI **atau** tambahkan langkahnya di `ci-cd.yml` (pilih salah satu, samakan dokumen dan workflow).
- Tulis di dokumen bahwa model proses adalah *Waterfall berpintu kualitas* untuk pengembangan aplikasi, sedangkan siklus v(n) adalah siklus **penelitian**, bukan siklus pengembangan.
- Perbarui jumlah tes di semua dokumen sesuai hasil `npm run test` terbaru (jangan ditebak).
- Tambah di README bagian **"Menyambungkan ke Kaggle"**: format origin CORS yang benar (`https://<username>.github.io`, tanpa nama repo; isi variabel `GITHUB_PAGES_USERNAME` di cell FastAPI notebook), URL ngrok berubah tiap sesi, field body `/chat`, nama secret yang dibutuhkan notebook (`NGROK_AUTHTOKEN`, `CHAT_API_KEY`) tanpa nilainya, dan bahwa model default deployment adalah `sft`.
- Jangan membuat README atau dokumen yang menyatakan API key aman karena "tidak disimpan": key tetap terlihat oleh pemakai yang menempelkannya. Tulis bahwa key hanya kunci demo yang boleh diganti kapan saja.
- Pastikan `vite.config.ts` memakai `base` sesuai nama repo GitHub Pages.

## TUGAS 10 — Tes kontrak terhadap format ekspor notebook
Notebook (`ekspor_hasil_final`, Langkah 20d) mengekspor folder `export_{run_tag}` dan `export_{run_tag}.zip`. Website harus membaca format itu dengan benar.
- **`MANIFEST.json`**: bila peneliti mengunggah ekspor, hitung SHA-256 tiap berkas yang diunggah dan bandingkan dengan `MANIFEST.json`; tampilkan berkas yang tidak cocok atau hilang. Jangan menolak total, cukup beri peringatan jelas.
- **`config_eksperimen.json`**: tampilkan ringkasan hyperparameter (SFT dan DPO, seed, `CHUNK_SIZE`, versi paket) di Admin, hanya baca.
- **`metrik_final_test.xlsx`**: sheet `SFT_vs_DPO_FinalTest` (kolom `Tahap, Token Precision, Token Recall, Token F1, BERTScore F1, Jumlah Test`; `Tahap` hanya `"SFT"` dan `"SFT + DPO"`) dan `SFT_vs_DPO_CI` (kolom `Metrik, Selisih (DPO - SFT), CI95 bawah, CI95 atas, n, n_grup, Identik (%)`). Tolak dengan pesan jelas bila kolom atau nilai `Tahap` berbeda.
- **`paket_tugas_guru.json` v2**: `{"versi":2,"dibuat","set","siklus","tugas":[{"id","kelas","pertanyaan","acuan","context","varian":"fixed","sft","dpo","identik"}]}`; `identik` harus konsisten dengan `normalizeAnswer`; tolak bila `versi` bukan 2.
- Buat fixture kecil (3–5 baris tiruan) untuk tiap format di atas di `src/lib/__tests__/fixtures/`, lalu tes impor valid dan kasus galat (kolom hilang, `versi` salah, `Tahap` tidak dikenal, hash tidak cocok). Fixture dibuat dari spesifikasi di atas; bila peneliti dapat memberi satu ekspor asli dari Kaggle, tambahkan sebagai fixture tambahan setelah menghapus isi soal yang tidak boleh dipublikasikan.
- **Rubrik guru**: notebook (Langkah 21a) mendefinisikan lima kriteria skala 1–5 (ketepatan materi, relevansi, kejelasan bahasa, kesesuaian usia, keamanan), sedangkan website memakai `Keputusan` dengan 4 nilai dan 27 kolom `Evaluasi_Guru`. **Jangan mengubah 27 kolom.** Periksa apakah lima kriteria itu terwakili di kolom yang ada; bila tidak, jangan menambah kolom, tetapi tulis di laporan akhir bahwa rubrik 1–5 notebook tidak dipakai website dan perlu diputuskan peneliti mana yang dipakai di Bab Hasil.

---

## Kriteria selesai (Definition of Done)
- [ ] `npx tsc --noEmit` bersih, `npm run test` lulus semua (tes lama + tes baru), `npm run build` sukses.
- [ ] Tidak ada URL ngrok/API key di kode, ekspor, atau penyimpanan browser (buktikan dengan grep).
- [ ] 27 kolom `Evaluasi_Guru` tidak berubah (tes kontrak lama lulus).
- [ ] Laporan akhir: daftar file yang diubah, jumlah tes sebelum/sesudah, dan hal yang **tidak** bisa kamu verifikasi (mis. koneksi nyata ke Kaggle).
- [ ] Jangan klaim "terhubung ke Kaggle" bila hanya diuji dengan mock.
- [ ] Nama berkas validasi dari notebook (`sft_merged_validation_details.csv`, `dpo_validation_details.csv`) diterima dan ada di tes.
- [ ] Opsi DPO dinonaktifkan di UI bila `/health` tidak memuat `dpo`.
- [ ] `dpo_eos_check.json` dan `final_test_log.json` dapat diimpor, dan checklist EOS tidak bisa dicentang sebelum ada hasil cek.
- [ ] Laporan akhir memuat daftar ketidakcocokan dengan notebook yang kamu temukan (bila ada) dan keputusan yang diambil untuk tiap-tiapnya.
