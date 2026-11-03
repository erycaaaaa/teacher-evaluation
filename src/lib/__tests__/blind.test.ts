import { describe, it, expect } from 'vitest';
import { hash, isSwap, getPlacement, deriveDecision, deriveScores } from '../blind';

describe('Blind A/B Placement & Mapping (blind.ts)', () => {
  it('should calculate deterministic FNV-1a hash matching specification', () => {
    // Specification:
    // hash(id): h = 2166136261; for c of ("tugas-" + id): h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); return h >>> 0
    const testIds = ['PJOK_0001', 'PJOK_0002', '1', '42', 'test-item'];
    for (const id of testIds) {
      let expectedH = 2166136261;
      const str = 'tugas-' + id;
      for (let i = 0; i < str.length; i++) {
        expectedH ^= str.charCodeAt(i);
        expectedH = Math.imul(expectedH, 16777619);
      }
      expectedH = expectedH >>> 0;

      expect(hash(id)).toBe(expectedH);
    }
  });

  it('should swap deterministically based on hash parity', () => {
    const id = 'PJOK_TEST_1';
    const h = hash(id);
    const expectedSwap = h % 2 === 1;

    expect(isSwap(id)).toBe(expectedSwap);
    const placement = getPlacement(id);

    if (expectedSwap) {
      expect(placement).toEqual({ A: 'dpo', B: 'sft' });
    } else {
      expect(placement).toEqual({ A: 'sft', B: 'dpo' });
    }
  });

  it('should correctly map user decision back to original model stage', () => {
    // Find an ID that swaps and an ID that does not swap
    let swappedId = '';
    let nonSwappedId = '';
    for (let i = 1; i <= 100; i++) {
      const id = 'ID_' + i;
      if (isSwap(id) && !swappedId) swappedId = id;
      if (!isSwap(id) && !nonSwappedId) nonSwappedId = id;
      if (swappedId && nonSwappedId) break;
    }

    // For swapped ID: A is dpo, B is sft
    expect(deriveDecision('a', swappedId)).toBe('dpo_lebih_baik');
    expect(deriveDecision('b', swappedId)).toBe('sft_lebih_baik');
    expect(deriveDecision('seri', swappedId)).toBe('seri');
    expect(deriveDecision('tolak', swappedId)).toBe('keduanya_tidak_dapat_diterima');

    // For non-swapped ID: A is sft, B is dpo
    expect(deriveDecision('a', nonSwappedId)).toBe('sft_lebih_baik');
    expect(deriveDecision('b', nonSwappedId)).toBe('dpo_lebih_baik');
    expect(deriveDecision('seri', nonSwappedId)).toBe('seri');
    expect(deriveDecision('tolak', nonSwappedId)).toBe('keduanya_tidak_dapat_diterima');

    // For identical tasks: always 'seri'
    expect(deriveDecision('a', swappedId, true)).toBe('seri');
    expect(deriveDecision('b', nonSwappedId, true)).toBe('seri');
  });

  it('should map criteria scores to SFT and DPO accurately based on placement', () => {
    // Swapped: A is dpo, B is sft
    let swappedId = '';
    for (let i = 1; i <= 100; i++) {
      if (isSwap('T_' + i)) {
        swappedId = 'T_' + i;
        break;
      }
    }

    const skorA = { 0: 5, 1: 4, 2: 5, 3: 4, 4: 5 };
    const skorB = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3 };

    const res = deriveScores(skorA, skorB, swappedId, 5, false);
    // Since swapped: SFT gets B scores, DPO gets A scores
    expect(res.skorSFT).toEqual([3, 3, 3, 3, 3]);
    expect(res.skorDPO).toEqual([5, 4, 5, 4, 5]);

    // For identical answers: both SFT and DPO get the single score set
    const resIdentik = deriveScores(skorA, skorB, swappedId, 5, true);
    expect(resIdentik.skorSFT).toEqual([5, 4, 5, 4, 5]);
    expect(resIdentik.skorDPO).toEqual([5, 4, 5, 4, 5]);
  });

  it('menghasilkan distribusi ~50/50 penempatan swap pada ≥1000 ID acak/berurutan', () => {
    let swapCount = 0;
    const total = 1000;
    for (let i = 1; i <= total; i++) {
      if (isSwap(`PJOK_${i.toString().padStart(4, '0')}`)) {
        swapCount++;
      }
    }
    const ratio = swapCount / total;
    // Rasio harus mendekati 0.5 (toleransi 0.45 - 0.55)
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('salt berbeda (tugas- vs pref-) mengubah nilai hash dan penempatan secara deterministik', () => {
    // Sifat matematis FNV-1a modulo 2:
    // Jumlah karakter ber-ASCII ganjil pada 'tugas-' adalah 5 (ganjil),
    // sedangkan pada 'pref-' adalah 2 (genap), sehingga paritas bit terendah
    // antara 'tugas-' dan 'pref-' berbeda secara deterministik.
    for (let i = 1; i <= 20; i++) {
      const id = `PJOK_${i.toString().padStart(4, '0')}`;
      const hashTugas = hash(id, 'tugas-');
      const hashPref = hash(id, 'pref-');
      expect(hashTugas).not.toBe(hashPref);
      expect(isSwap(id, 'tugas-')).not.toBe(isSwap(id, 'pref-'));
    }
  });
});
