import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { buildFeedbackWorkbook } from '../exportXlsx';
import {
  feedbackGroupComplete,
  groupFeedbackRows,
  parseFeedbackFile,
  stableFeedbackDisplayOrder,
} from '../feedback';
import { FeedbackRow } from '../feedback';
import { RUBRIK_DEFAULT } from '../constants';

const fixture: FeedbackRow[] = [
  { id: 'PJOK_0315', kelas: '3', pertanyaan: 'P?', context: 'C', jawaban: 'Jawaban pertama', status: '' },
  { id: 'PJOK_0315', kelas: '3', pertanyaan: 'P?', context: 'C', jawaban: 'Jawaban kedua', status: '' },
  { id: '0012', kelas: '4', pertanyaan: 'P2?', context: 'C2', jawaban: 'Jawaban tiga', status: '' },
  { id: '0012', kelas: '4', pertanyaan: 'P2?', context: 'C2', jawaban: 'Jawaban empat', status: '' },
];

async function workbookFile(rows: FeedbackRow[], name = 'template.xlsx'): Promise<File> {
  const workbook = await buildFeedbackWorkbook(rows);
  const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new File([data], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

describe('template Feedback', () => {
  it('membaca sheet Feedback, mempertahankan id teks, dan mengelompokkan dua baris per ID', async () => {
    const result = await parseFeedbackFile(await workbookFile(fixture));
    expect(result.error).toBeUndefined();
    expect(result.groups?.map(group => [group.id, group.rows.length])).toEqual([
      ['PJOK_0315', 2],
      ['0012', 2],
    ]);
    expect(result.rows?.map(row => row.id)).toEqual(fixture.map(row => row.id));
  });

  it('menerima CSV, menolak kolom wajib yang hilang, dan memperingatkan pasangan tidak tepat dua baris', async () => {
    const csv = 'id,pertanyaan,jawaban,status\nID_1,Pertanyaan,Jawaban,\n';
    const validCsv = new File([csv], 'template.csv', { type: 'text/csv' });
    const parsedCsv = await parseFeedbackFile(validCsv);
    expect(parsedCsv.rows?.[0].id).toBe('ID_1');
    expect(parsedCsv.rows?.[0].kelas).toBe('');
    expect(parsedCsv.rows?.[0].context).toBe('');
    expect(parsedCsv.rubrik).toEqual(RUBRIK_DEFAULT);
    expect(parsedCsv.skor).toEqual({});
    expect(parsedCsv.warnings).toContain('ID "ID_1" memiliki 1 baris, seharusnya tepat 2.');

    const invalidCsv = new File(['id,kelas,pertanyaan,context,status\n1,1,P,C,'], 'invalid.csv', { type: 'text/csv' });
    const invalid = await parseFeedbackFile(invalidCsv);
    expect(invalid.error).toContain('jawaban');
  });

  it('membaca ID XLSX numerik dengan format nol di depan sebagai teks', async () => {
    const workbook = await buildFeedbackWorkbook(fixture);
    const sheet = workbook.Sheets.Feedback;
    sheet.A2 = { t: 'n', v: 12, z: '0000' };
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const file = new File([data], 'formatted-id.xlsx');
    const result = await parseFeedbackFile(file);
    expect(result.rows?.[0].id).toBe('0012');
  });

  it('mengembalikan rubrik dari sheet Rubrik saat parsing template XLSX', async () => {
    const rubrik = [{
      kriteria: 'Rubrik khusus',
      skor1: 'Kurang khusus',
      skor3: 'Cukup khusus',
      skor5: 'Baik khusus',
    }];
    const workbook = await buildFeedbackWorkbook(fixture, rubrik);
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const result = await parseFeedbackFile(new File([data], 'template-khusus.xlsx'));

    expect(result.rows).toEqual(fixture);
    expect(result.rubrik).toEqual(rubrik);
    expect(result.rubrikWarning).toBeUndefined();
  });

  it('memulihkan skor dari sheet Skor pada template hasil', async () => {
    const rubric = [{ kriteria: 'Ketepatan', skor1: 'x', skor3: 'y', skor5: 'z' }];
    const scores = { [JSON.stringify(['PJOK_0315', 'Jawaban pertama'])]: { Ketepatan: 4 as const } };
    const workbook = await buildFeedbackWorkbook(fixture, rubric, scores);
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const result = await parseFeedbackFile(new File([data], 'hasil.xlsx'));
    expect(result.skor).toEqual(scores);
    expect(result.skorWarning).toBeUndefined();
  });

  it('tetap memuat Feedback dengan Rubrik dan Skor rusak serta mengembalikan peringatan', async () => {
    const workbook = await buildFeedbackWorkbook(fixture);
    workbook.Sheets.Rubrik.A1 = { t: 's', v: 'judul salah' };
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([['id', 'nilai'], ['PJOK_0315', 3]]),
      'Skor',
    );
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const result = await parseFeedbackFile(new File([data], 'sheet-rusak.xlsx'));

    expect(result.error).toBeUndefined();
    expect(result.rows).toEqual(fixture);
    expect(result.rubrikWarning).toContain('Header sheet "Rubrik" tidak lengkap');
    expect(result.skorWarning).toContain('Header sheet "Skor" tidak lengkap');
  });

  it('mensyaratkan sheet Feedback pada file XLSX', async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['id']]), 'Sheet1');
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const file = new File([data], 'wrong-sheet.xlsx');
    expect((await parseFeedbackFile(file)).error).toContain('sheet bernama "Feedback"');
  });

  it('mengurutkan tampilan stabil per ID tanpa mengubah urutan data ekspor dan menghitung pasangan lengkap', () => {
    const groups = groupFeedbackRows(fixture);
    const first = stableFeedbackDisplayOrder(groups[0]);
    expect(stableFeedbackDisplayOrder(groups[0])).toEqual(first);
    expect(new Set(first.map(row => row.jawaban))).toEqual(new Set(['Jawaban pertama', 'Jawaban kedua']));
    expect(fixture.map(row => row.jawaban)).toEqual(['Jawaban pertama', 'Jawaban kedua', 'Jawaban tiga', 'Jawaban empat']);
    expect(feedbackGroupComplete(groups[0])).toBe(false);
    expect(feedbackGroupComplete({ id: 'x', rows: fixture.slice(0, 2).map(row => ({ ...row, status: 'Yes' })) })).toBe(true);
    expect(feedbackGroupComplete({
      id: '',
      rows: fixture.slice(0, 2).map(row => ({ ...row, status: 'Yes' })),
    })).toBe(false);
    expect(feedbackGroupComplete({
      id: 'empty-answer',
      rows: fixture.slice(0, 2).map((row, index) => ({
        ...row,
        id: 'empty-answer',
        jawaban: index === 0 ? '' : row.jawaban,
        status: 'Yes',
      })),
    })).toBe(false);
  });
});
