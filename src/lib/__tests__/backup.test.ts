import { describe, it, expect, beforeEach } from 'vitest';
import { buatCadanganData, pulihkanCadanganData } from '../backup';

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

describe('backup.ts — Pengaman Data (Round-trip & Keamanan API Key)', () => {
  beforeEach(() => {
    const mock = new MockStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mock,
      writable: true,
      configurable: true,
    });
    localStorage.clear();
  });

  it('tes round-trip: cadangkan -> kosongkan -> pulihkan -> data sama', () => {
    localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify([{ id: 'PJOK_0315', jawaban: 'A', status: 'Yes' }]));
    localStorage.setItem('qb_guru_anotasi_template_v1', 'template.xlsx');
    localStorage.setItem('qb_guru_anotasi_rubrik_v1', JSON.stringify([{ kriteria: 'Khusus' }]));
    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify({ '["ID","A"]': { Khusus: 4 } }));
    localStorage.setItem('qb_guru_profil_v1', JSON.stringify({ kode: 'GURU_01', kelas: [1, 2] }));
    localStorage.setItem('qb_guru_eval_paket_v1', JSON.stringify({ versi: 2, set: 'final_test' }));
    localStorage.setItem('qb_guru_eval_data_v1', JSON.stringify({ hasil: { PJOK_01: { keputusan: 'dpo_lebih_baik' } } }));

    // 1. Buat cadangan
    const cadangan = buatCadanganData();
    expect(cadangan.versi).toBe(2);
    const jsonStr = JSON.stringify(cadangan);

    // 2. Verifikasi tidak ada kunci rahasia
    expect(jsonStr).not.toContain('apiKey');
    expect(jsonStr).not.toContain('X-API-Key');

    // 3. Kosongkan localStorage
    localStorage.clear();
    expect(localStorage.getItem('qb_guru_anotasi_rows_v1')).toBeNull();
    expect(localStorage.getItem('qb_guru_profil_v1')).toBeNull();

    // 4. Pulihkan dari cadangan
    const hasil = pulihkanCadanganData(jsonStr);
    expect(hasil.sukses).toBe(true);
    expect(hasil.jumlahKunci).toBe(7);

    // 5. Data setelah dipulihkan sama persis
    expect(JSON.parse(localStorage.getItem('qb_guru_anotasi_rows_v1')!)).toEqual([{ id: 'PJOK_0315', jawaban: 'A', status: 'Yes' }]);
    expect(localStorage.getItem('qb_guru_anotasi_template_v1')).toBe('template.xlsx');
    expect(JSON.parse(localStorage.getItem('qb_guru_anotasi_rubrik_v1')!)).toEqual([{ kriteria: 'Khusus' }]);
    expect(JSON.parse(localStorage.getItem('qb_guru_anotasi_skor_v1')!)).toEqual({ '["ID","A"]': { Khusus: 4 } });
    expect(JSON.parse(localStorage.getItem('qb_guru_profil_v1')!)).toEqual({ kode: 'GURU_01', kelas: [1, 2] });
    expect(JSON.parse(localStorage.getItem('qb_guru_eval_paket_v1')!)).toEqual({ versi: 2, set: 'final_test' });
    expect(JSON.parse(localStorage.getItem('qb_guru_eval_data_v1')!)).toEqual({ hasil: { PJOK_01: { keputusan: 'dpo_lebih_baik' } } });
  });

  it('tidak memuat string API key atau kunci rahasia dalam berkas cadangan', () => {
    localStorage.setItem('qb_guru_profil_v1', JSON.stringify({ kode: 'GURU_01' }));
    // Simulasi jika ada key yang dinamai api_key
    localStorage.setItem('qb_secret_apikey', 'rahasia12345');
    localStorage.setItem('qb_token_secret', 'secretToken');

    const cadangan = buatCadanganData();
    const jsonStr = JSON.stringify(cadangan);

    expect(cadangan.data['qb_secret_apikey']).toBeUndefined();
    expect(cadangan.data['qb_token_secret']).toBeUndefined();
    expect(jsonStr).not.toContain('rahasia12345');
    expect(jsonStr).not.toContain('secretToken');
  });
});
