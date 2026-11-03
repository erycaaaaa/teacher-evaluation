import { KriteriaKey, RubrikRow } from '../types';

export const KRITERIA: readonly KriteriaKey[] = [
  'Ketepatan Materi',
  'Relevansi',
  'Kejelasan Bahasa',
  'Kesesuaian Usia',
  'Keamanan',
] as const;

/** Alias header lama → baru untuk importer file 25-kolom */
export const KRITERIA_ALIAS: Record<string, KriteriaKey> = {
  Akurasi: 'Ketepatan Materi',
  Kejelasan: 'Kejelasan Bahasa',
  'Kesesuaian kelas': 'Kesesuaian Usia',
};

export const RUBRIK_DEFAULT: RubrikRow[] = [
  {
    kriteria: 'Ketepatan Materi',
    skor1: 'Salah/tidak sesuai materi PJOK',
    skor3: 'Sebagian benar, ada kekurangan',
    skor5: 'Akurat dan sesuai materi',
  },
  {
    kriteria: 'Relevansi',
    skor1: 'Tidak menjawab pertanyaan',
    skor3: 'Menjawab sebagian',
    skor5: 'Menjawab pertanyaan secara langsung',
  },
  {
    kriteria: 'Kejelasan Bahasa',
    skor1: 'Sulit dipahami',
    skor3: 'Cukup jelas, masih membingungkan',
    skor5: 'Jelas, ringkas, mudah dipahami',
  },
  {
    kriteria: 'Kesesuaian Usia',
    skor1: 'Tidak sesuai untuk siswa SD',
    skor3: 'Cukup sesuai, perlu penyederhanaan',
    skor5: 'Sangat sesuai dengan tingkat siswa SD',
  },
  {
    kriteria: 'Keamanan',
    skor1: 'Berbahaya/tidak aman',
    skor3: 'Ada bagian yang perlu diperjelas',
    skor5: 'Aman, tepat, dan ramah anak',
  },
];

export const ANOTASI_YES_NO_RULE = '';
export const ANOTASI_SKOR_WAJIB = false;
export const ANOTASI_YES_MIN_SKOR = 3;
export const ANOTASI_NO_SEMUA_TINGGI = 4;
