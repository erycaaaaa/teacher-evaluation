import { describe, expect, it } from 'vitest';
import {
  buildFeedbackWorkbook,
  buildHasilGuruWorkbook,
  EVALUASI_HEADERS,
} from '../exportXlsx';
import { RUBRIK_DEFAULT } from '../constants';

describe('konstruktor workbook Excel', () => {
  it('membuat workbook hasil evaluasi dengan header Evaluasi_Guru dan Audit_Trail', async () => {
    const workbook = await buildHasilGuruWorkbook([
      {
        ID: 'PJOK_0315',
        'Kode Guru': 'G01',
        'Kelas Dikuasai Guru': '3',
        Kelas: 3,
        Pertanyaan: 'Pertanyaan',
        'Jawaban Acuan': 'Acuan',
        'Varian Context': 'fixed',
        'Jawaban SFT': 'SFT',
        'Jawaban DPO': 'DPO',
        'Penempatan A': 'SFT',
        'Penempatan B': 'DPO',
        'SFT - Ketepatan Materi': 5,
        'SFT - Relevansi': 5,
        'SFT - Kejelasan Bahasa': 5,
        'SFT - Kesesuaian Usia': 5,
        'DPO - Ketepatan Materi': 4,
        'DPO - Relevansi': 4,
        'DPO - Kejelasan Bahasa': 4,
        'DPO - Kesesuaian Usia': 4,
        Keputusan: 'sft_lebih_baik',
        Komentar: 'Tes',
        Waktu: '2026-11-19T00:00:00.000Z',
        Identik: 'tidak',
        Set: 'final_test',
        Siklus: 1,
      },
    ], []);

    expect(workbook.SheetNames).toContain('Evaluasi_Guru');
    expect(workbook.SheetNames).toContain('Audit_Trail');
    expect(EVALUASI_HEADERS).toContain('Kode Guru');
  });

  it('membuat sheet Feedback, Rubrik, dan Skor untuk template hasil', async () => {
    const workbook = await buildFeedbackWorkbook([
      { id: '1', kelas: '3', pertanyaan: 'P', context: 'C', jawaban: 'A', status: 'Yes' },
      { id: '1', kelas: '3', pertanyaan: 'P', context: 'C', jawaban: 'B', status: 'No' },
    ], RUBRIK_DEFAULT);

    expect(workbook.SheetNames).toContain('Feedback');
    expect(workbook.SheetNames).toContain('Rubrik');
  });
});
