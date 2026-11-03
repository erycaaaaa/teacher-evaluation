import { KeputusanGuruUI, KeputusanModel } from '../types';

/**
 * FNV-1a 32-bit hash function untuk penempatan deterministik A/B
 * Hash dari string salt + id (default salt = 'tugas-', untuk preferensi salt = 'pref-')
 */
export function hash(id: string, salt: string = 'tugas-'): number {
  let h = 2166136261;
  const str = salt + id;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Cek apakah penempatan ditukar (swap)
 * swap = hash(id, salt) % 2 === 1
 */
export function isSwap(id: string, salt: string = 'tugas-'): boolean {
  return hash(id, salt) % 2 === 1;
}

/**
 * Dapatkan penempatan A dan B untuk suatu ID tugas
 * swap ? { A: 'dpo', B: 'sft' } : { A: 'sft', B: 'dpo' }
 */
export function getPlacement(
  id: string,
  salt: string = 'tugas-'
): { A: 'sft' | 'dpo'; B: 'sft' | 'dpo' } {
  const swapped = isSwap(id, salt);
  return swapped ? { A: 'dpo', B: 'sft' } : { A: 'sft', B: 'dpo' };
}

/**
 * Memetakan keputusan pilihan antarmuka Guru ('a' | 'b' | 'seri' | 'tolak')
 * kembali ke KeputusanModel ('dpo_lebih_baik' | 'sft_lebih_baik' | 'seri' | 'keduanya_tidak_dapat_diterima')
 */
export function deriveDecision(
  keputusanUI: KeputusanGuruUI,
  id: string,
  identik: boolean = false,
  salt: string = 'tugas-'
): KeputusanModel {
  if (identik) {
    return 'seri';
  }

  if (keputusanUI === 'seri') {
    return 'seri';
  }

  if (keputusanUI === 'tolak') {
    return 'keduanya_tidak_dapat_diterima';
  }

  const placement = getPlacement(id, salt);
  const chosenModel = placement[keputusanUI === 'a' ? 'A' : 'B'];
  return chosenModel === 'dpo' ? 'dpo_lebih_baik' : 'sft_lebih_baik';
}

/**
 * Memetakan skor Jawaban A dan Jawaban B kembali ke SFT dan DPO
 */
export function deriveScores(
  skorA: Record<number, number>,
  skorB: Record<number, number>,
  id: string,
  kriteriaCount: number = 5,
  identik: boolean = false,
  salt: string = 'tugas-'
): { skorSFT: (number | null)[]; skorDPO: (number | null)[] } {
  const getArray = (record: Record<number, number>) =>
    Array.from({ length: kriteriaCount }, (_, i) => (record[i] !== undefined ? record[i] : null));

  if (identik) {
    const single = getArray(skorA);
    return {
      skorSFT: [...single],
      skorDPO: [...single],
    };
  }

  const arrA = getArray(skorA);
  const arrB = getArray(skorB);
  const placement = getPlacement(id, salt);

  if (placement.A === 'sft') {
    return {
      skorSFT: arrA,
      skorDPO: arrB,
    };
  } else {
    return {
      skorSFT: arrB,
      skorDPO: arrA,
    };
  }
}
