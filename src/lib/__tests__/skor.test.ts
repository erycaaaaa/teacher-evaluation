import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { FeedbackRow } from '../feedback';
import { buildSkorSheet, parseSkorSheet, toggleSkor } from '../skor';
import { RubrikRow, SkorJawaban } from '../../types';

const rows: FeedbackRow[] = [
  { id: 'ID1', kelas: '1', pertanyaan: 'P', context: '', jawaban: 'Jawaban A', status: '' },
  { id: 'ID1', kelas: '1', pertanyaan: 'P', context: '', jawaban: 'Jawaban B', status: '' },
];
const rubric: RubrikRow[] = [
  { kriteria: 'Ketepatan', skor1: 'x', skor3: 'y', skor5: 'z' },
  { kriteria: 'Relevansi', skor1: 'x', skor3: 'y', skor5: 'z' },
];
const answerKey = JSON.stringify(['ID1', 'Jawaban A']);

function workbookWithScores(scoreRows: unknown[][]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(scoreRows), 'Skor');
  return workbook;
}

describe('sheet Skor', () => {
  it('membaca skor valid dan mengabaikan skor/rubrik/baris yang tidak valid dengan warning', () => {
    const result = parseSkorSheet(workbookWithScores([
      ['id', 'jawaban', 'kriteria', 'skor'],
      ['ID1', 'Jawaban A', 'Ketepatan', 5],
      ['ID1', 'Jawaban A', 'Relevansi', 7],
      ['ID1', 'Jawaban A', 'Asing', 3],
      ['HILANG', 'Tidak ada', 'Ketepatan', 4],
    ]), rubric, rows);
    expect(result.skor).toEqual({ [answerKey]: { Ketepatan: 5 } });
    expect(result.warning).toContain('3 baris');
  });

  it('mengabaikan Skor rusak tanpa menggagalkan parse', () => {
    const result = parseSkorSheet(workbookWithScores([['id', 'skor'], ['ID1', 4]]), rubric, rows);
    expect(result.skor).toEqual({});
    expect(result.warning).toContain('Header sheet "Skor" tidak lengkap');
  });

  it('membangun sheet format panjang sesuai urutan sumber dan kriteria rubrik', () => {
    const scoreData: Record<string, SkorJawaban> = {
      [JSON.stringify(['ID1', 'Jawaban A'])]: { Relevansi: 3, Ketepatan: 5 },
      [JSON.stringify(['ID1', 'Jawaban B'])]: { Ketepatan: 4 },
    };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, buildSkorSheet(scoreData, rubric, rows), 'Skor');
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const reloaded = XLSX.read(data, { type: 'array', raw: false });
    const parsedRows = XLSX.utils.sheet_to_json<unknown[]>(reloaded.Sheets.Skor, { header: 1 });
    expect(parsedRows).toEqual([
      ['id', 'jawaban', 'kriteria', 'skor'],
      ['ID1', 'Jawaban A', 'Ketepatan', 5],
      ['ID1', 'Jawaban A', 'Relevansi', 3],
      ['ID1', 'Jawaban B', 'Ketepatan', 4],
    ]);
    expect(parseSkorSheet(reloaded, rubric, rows).skor).toEqual(scoreData);
  });

  it('toggleSkor memilih skor dan klik ulang mengosongkannya', () => {
    const selected = toggleSkor({}, 'Ketepatan', 3);
    expect(selected).toEqual({ Ketepatan: 3 });
    expect(toggleSkor(selected, 'Ketepatan', 3)).toEqual({});
  });
});
