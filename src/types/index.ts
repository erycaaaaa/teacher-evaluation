export type KriteriaKey =
  | 'Ketepatan Materi'
  | 'Relevansi'
  | 'Kejelasan Bahasa'
  | 'Kesesuaian Usia'
  | 'Keamanan';

export type RubrikRow = {
  kriteria: string;
  skor1: string;
  skor3: string;
  skor5: string;
};

export type NilaiSkor = 1 | 2 | 3 | 4 | 5;
export type SkorJawaban = Record<string, NilaiSkor>;

export type KeputusanGuruUI = 'a' | 'b' | 'seri' | 'tolak';

export type KeputusanModel =
  | 'dpo_lebih_baik'
  | 'sft_lebih_baik'
  | 'seri'
  | 'keduanya_tidak_dapat_diterima';

export interface Tugas {
  id: string;
  kelas: string | number;
  pertanyaan: string;
  acuan: string;
  context: string;
  varian: string;
  sft: string;
  dpo: string;
  identik: boolean;
}

export interface PaketTugas {
  versi: number;
  dibuat: string;
  set: 'validasi' | 'final_test';
  siklus: number;
  tugas: Tugas[];
}

export interface GuruProfil {
  kode: string;
  kelas: number[];
  hanya: boolean;
}

export interface PenilaianTugasMentah {
  skorA: Record<number, number>;
  skorB: Record<number, number>;
  keputusan: KeputusanGuruUI | null;
  komentar: string;
  kotor: boolean;
}

export interface HasilPenilaianTugas {
  id: string;
  skorSFT: (number | null)[];
  skorDPO: (number | null)[];
  keputusan: KeputusanModel;
  komentar: string;
  waktu: string;
  identik: boolean;
  penempatanA: 'SFT' | 'DPO';
  penempatanB: 'SFT' | 'DPO';
  mentah: PenilaianTugasMentah;
}

export interface AuditTrailEntry {
  id: string;
  keputusan: KeputusanModel;
  komentar: string;
  skorSFT: (number | null)[];
  skorDPO: (number | null)[];
  waktu: string;
  diarsipkan: string;
}

export interface EvaluasiGuruRow {
  ID: string;
  'Kode Guru': string;
  'Kelas Dikuasai Guru': string;
  Kelas: string | number;
  Pertanyaan: string;
  'Jawaban Acuan': string;
  'Varian Context': string;
  'Jawaban SFT': string;
  'Jawaban DPO': string;
  'Penempatan A': 'SFT' | 'DPO';
  'Penempatan B': 'SFT' | 'DPO';
  'SFT - Ketepatan Materi': number | string;
  'SFT - Relevansi': number | string;
  'SFT - Kejelasan Bahasa': number | string;
  'SFT - Kesesuaian Usia': number | string;
  'SFT - Keamanan': number | string;
  'DPO - Ketepatan Materi': number | string;
  'DPO - Relevansi': number | string;
  'DPO - Kejelasan Bahasa': number | string;
  'DPO - Kesesuaian Usia': number | string;
  'DPO - Keamanan': number | string;
  Keputusan: KeputusanModel;
  Komentar: string;
  Waktu: string;
  Identik: 'ya' | 'tidak';
  Set: 'validasi' | 'final_test';
  Siklus: number;
}

export interface AuditTrailRow {
  ID: string;
  Keputusan: string;
  Komentar: string;
  'Skor SFT': string;
  'Skor DPO': string;
  Waktu: string;
  Diarsipkan: string;
}
