import { describe, expect, it } from 'vitest';
import { validatePaketGuru } from '../paket';

const validPacket = {
  versi: 2,
  dibuat: '2026-10-27T00:00:00.000Z',
  set: 'final_test',
  siklus: 3,
  tugas: [{
    id: 'PJOK_0315',
    kelas: 3,
    pertanyaan: 'Apa manfaat pemanasan?',
    acuan: 'Mempersiapkan tubuh sebelum olahraga.',
    context: 'Materi pemanasan.',
    varian: 'fixed',
    sft: 'Jawaban SFT.',
    dpo: 'Jawaban DPO.',
    identik: false,
  }],
};

describe('validatePaketGuru — kontrak notebook versi 2', () => {
  it('menerima paket validasi/final_test dan mempertahankan ID sebagai string', () => {
    const result = validatePaketGuru(JSON.stringify(validPacket));
    expect(result.sukses).toBe(true);
    expect(result.paket?.set).toBe('final_test');
    expect(result.paket?.siklus).toBe(3);
    expect(result.paket?.tugas[0].id).toBe('PJOK_0315');
    expect(result.paket?.tugas[0].identik).toBe(false);
  });

  it('menolak versi, set, dan struktur tugas yang tidak sesuai notebook', () => {
    expect(validatePaketGuru(JSON.stringify({ ...validPacket, versi: 1 })).pesan).toContain('versi 2');
    expect(validatePaketGuru(JSON.stringify({ ...validPacket, set: 'anotasi' })).pesan).toContain('validasi');
    expect(validatePaketGuru(JSON.stringify({
      ...validPacket,
      tugas: [{ ...validPacket.tugas[0], context: '' }],
    })).pesan).toContain('"context"');
  });

  it('menolak ID duplikat dan field boolean identik yang hilang', () => {
    expect(validatePaketGuru(JSON.stringify({
      ...validPacket,
      tugas: [validPacket.tugas[0], validPacket.tugas[0]],
    })).pesan).toContain('ID duplikat');
    const { identik: _removed, ...withoutIdenticalFlag } = validPacket.tugas[0];
    expect(validatePaketGuru(JSON.stringify({
      ...validPacket,
      tugas: [withoutIdenticalFlag],
    })).pesan).toContain('"identik"');
  });
});
