import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { buildFeedbackWorkbook, buildHasilGuruWorkbook, EVALUASI_HEADERS } from '../exportXlsx';
import { FEEDBACK_HEADERS, FeedbackRow } from '../feedback';
import { parseFeedbackFile } from '../feedback';
import { AuditTrailEntry, EvaluasiGuruRow } from '../../types';
import { RUBRIK_DEFAULT } from '../constants';

const evaluationRow: EvaluasiGuruRow = {
  ID: 'PJOK_0001',
  'Kode Guru': 'G01',
  'Kelas Dikuasai Guru': '1,2',
  Kelas: 1,
  Pertanyaan: 'Apa gerak lokomotor?',
  'Jawaban Acuan': 'Gerak berpindah tempat.',
  'Varian Context': 'fixed',
  'Jawaban SFT': 'Gerak pindah tempat.',
  'Jawaban DPO': 'Gerak tubuh.',
  'Penempatan A': 'SFT',
  'Penempatan B': 'DPO',
  'SFT - Ketepatan Materi': 5,
  'SFT - Relevansi': 4,
  'SFT - Kejelasan Bahasa': 5,
  'SFT - Kesesuaian Usia': 4,
  'SFT - Keamanan': 5,
  'DPO - Ketepatan Materi': 3,
  'DPO - Relevansi': 3,
  'DPO - Kejelasan Bahasa': 3,
  'DPO - Kesesuaian Usia': 3,
  'DPO - Keamanan': 3,
  Keputusan: 'sft_lebih_baik',
  Komentar: 'Lebih sesuai.',
  Waktu: '2026-10-27T00:00:00.000Z',
  Identik: 'tidak',
  Set: 'final_test',
  Siklus: 1,
};

const audit: AuditTrailEntry = {
  id: 'PJOK_0001',
  keputusan: 'seri',
  komentar: 'Perubahan',
  skorSFT: [3, 3, 3, 3, 3],
  skorDPO: [4, 4, 4, 4, 4],
  waktu: '2026-10-27T00:00:00.000Z',
  diarsipkan: '2026-10-27T00:01:00.000Z',
};

describe('ekspor XLSX', () => {
  it('mempertahankan sheet dan urutan header evaluasi yang digunakan notebook', async () => {
    const workbook = await buildHasilGuruWorkbook([evaluationRow], [audit]);
    expect(workbook.SheetNames).toEqual(['Evaluasi_Guru', 'Audit_Trail']);
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Evaluasi_Guru);
    expect(Object.keys(rows[0])).toEqual([...EVALUASI_HEADERS]);
    expect(rows[0]['SFT - Ketepatan Materi']).toBe(5);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets.Audit_Trail)).toHaveLength(1);
  });

  it('menulis template Feedback dengan header dan id string sesuai urutan asli', async () => {
    const rows: FeedbackRow[] = [
      { id: 'PJOK_0315', kelas: '3', pertanyaan: 'P?', context: 'C', jawaban: 'A', status: 'Yes' },
      { id: 'PJOK_0315', kelas: '3', pertanyaan: 'P?', context: 'C', jawaban: 'B', status: 'No' },
      { id: '0012', kelas: '4', pertanyaan: 'P2?', context: 'C2', jawaban: 'C', status: '' },
      { id: '0012', kelas: '4', pertanyaan: 'P2?', context: 'C2', jawaban: 'D', status: '' },
    ];
    const workbook = await buildFeedbackWorkbook(rows);
    expect(workbook.SheetNames).toEqual(['Feedback', 'Rubrik']);
    const sheet = workbook.Sheets.Feedback;
    const feedbackData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
    expect(feedbackData[0]).toEqual([...FEEDBACK_HEADERS]);
    expect(feedbackData[0]).toHaveLength(6);
    expect(feedbackData.slice(1)).toHaveLength(rows.length);
    const parsed = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
    expect(parsed.map(row => row.id)).toEqual(['PJOK_0315', 'PJOK_0315', '0012', '0012']);
    expect(parsed.map(row => row.jawaban)).toEqual(rows.map(row => row.jawaban));

    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const file = new File([data], 'feedback_guru.xlsx');
    const roundTrip = await parseFeedbackFile(file);
    expect(roundTrip.rows).toEqual(rows);
    expect(roundTrip.rubrik).toEqual(RUBRIK_DEFAULT);
    expect(XLSX.utils.sheet_to_json(workbook.Sheets.Rubrik, { header: 1 })[0]).toEqual([
      'kriteria', 'skor_1_kurang', 'skor_3_cukup', 'skor_5_baik',
    ]);
  });

  it('mengekspor Skor hanya saat terisi dan menyimpan sel rubrik/skor awalan formula sebagai teks', async () => {
    const rows: FeedbackRow[] = [
      { id: 'ID1', kelas: '1', pertanyaan: 'P', context: '', jawaban: '=1+1', status: '' },
    ];
    const rubric = [{ kriteria: '=FORMULA', skor1: '+1', skor3: '-1', skor5: '@SUM(A1)' }];
    const key = JSON.stringify(['ID1', '=1+1']);
    const withoutScore = await buildFeedbackWorkbook(rows, rubric);
    expect(withoutScore.SheetNames).toEqual(['Feedback', 'Rubrik']);

    const workbook = await buildFeedbackWorkbook(rows, rubric, { [key]: { '=FORMULA': 5 } });
    expect(workbook.SheetNames).toEqual(['Feedback', 'Rubrik', 'Skor']);
    for (const sheetName of ['Rubrik', 'Skor']) {
      const sheet = workbook.Sheets[sheetName];
      expect(Object.values(sheet).some(cell => typeof cell === 'object' && cell !== null && 'f' in cell)).toBe(false);
    }

    const exportedRubrik = workbook.Sheets.Rubrik;
    expect(exportedRubrik.A2.t).toBe('s');
    expect(exportedRubrik.A2.v).toBe('=FORMULA');
    const scoreSheet = workbook.Sheets.Skor;
    expect(scoreSheet.A2.t).toBe('s');
    expect(scoreSheet.B2.v).toBe('=1+1');
    expect(scoreSheet.C2.v).toBe('=FORMULA');
    const serialized = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const reloaded = XLSX.read(serialized, { type: 'array', raw: false });
    expect(reloaded.Sheets.Rubrik.A2.f).toBeUndefined();
    expect(reloaded.Sheets.Skor.B2.f).toBeUndefined();
    expect(reloaded.Sheets.Skor.C2.f).toBeUndefined();
  });
});
