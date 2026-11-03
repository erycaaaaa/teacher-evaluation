import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { RUBRIK_DEFAULT } from '../constants';
import { buildRubrikSheet, parseRubrikSheet } from '../rubrik';
import { RubrikRow } from '../../types';

const customRubrik: RubrikRow[] = [{
  kriteria: 'Ketepatan Materi khusus',
  skor1: 'Perlu diperbaiki',
  skor3: 'Cukup tepat',
  skor5: 'Sangat tepat',
}];

function workbookWithRubrik(rows: unknown[][]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Rubrik');
  return workbook;
}

describe('sheet Rubrik', () => {
  it('membaca rubrik dengan header lengkap tanpa peka kapitalisasi dan spasi tepi', () => {
    const result = parseRubrikSheet(workbookWithRubrik([
      [' Kriteria ', 'SKOR_1_KURANG', ' skor_3_cukup ', 'SKOR_5_BAIK'],
      [customRubrik[0].kriteria, customRubrik[0].skor1, customRubrik[0].skor3, customRubrik[0].skor5],
    ]));

    expect(result).toEqual({ rubrik: customRubrik, usedDefault: false });
  });

  it('menerima header alternatif dan mengabaikan kolom lain', () => {
    const result = parseRubrikSheet(workbookWithRubrik([
      ['Kriteria', 'Catatan', 'Skor 1', 'Skor 3', 'Skor 5'],
      ['Satu', 'diabaikan', 'Kurang', 'Cukup', 'Baik'],
    ]));
    expect(result.rubrik).toEqual([{ kriteria: 'Satu', skor1: 'Kurang', skor3: 'Cukup', skor5: 'Baik' }]);
  });

  it('menggunakan rubrik default tanpa warning jika sheet tidak ada', () => {
    const workbook = XLSX.utils.book_new();
    expect(parseRubrikSheet(workbook)).toEqual({ rubrik: RUBRIK_DEFAULT, usedDefault: true });
  });

  it('menggunakan default dan warning jika header tidak lengkap', () => {
    const result = parseRubrikSheet(workbookWithRubrik([
      ['kriteria', 'skor_1_kurang', 'skor_3_cukup'],
      ['Kriteria', 'Kurang', 'Cukup'],
    ]));

    expect(result.rubrik).toEqual(RUBRIK_DEFAULT);
    expect(result.usedDefault).toBe(true);
    expect(result.warning).toContain('Header sheet "Rubrik" tidak lengkap');
  });

  it('mengabaikan baris dengan kriteria kosong dan menggunakan default jika semua baris kosong', () => {
    const parsed = parseRubrikSheet(workbookWithRubrik([
      ['kriteria', 'skor_1_kurang', 'skor_3_cukup', 'skor_5_baik'],
      ['', 'x', 'y', 'z'],
      ['Satu', 'Kurang', 'Cukup', 'Baik'],
    ]));
    expect(parsed.rubrik).toEqual([{ kriteria: 'Satu', skor1: 'Kurang', skor3: 'Cukup', skor5: 'Baik' }]);

    const empty = parseRubrikSheet(workbookWithRubrik([
      ['kriteria', 'skor_1_kurang', 'skor_3_cukup', 'skor_5_baik'],
      ['', 'x', 'y', 'z'],
    ]));
    expect(empty.rubrik).toEqual(RUBRIK_DEFAULT);
    expect(empty.usedDefault).toBe(true);
    expect(empty.warning).toContain('tidak memiliki baris');
  });

  it('round-trip membangun dan membaca sheet Rubrik', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, buildRubrikSheet(customRubrik), 'Rubrik');
    const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const reloaded = XLSX.read(data, { type: 'array', raw: false });

    expect(XLSX.utils.sheet_to_json(reloaded.Sheets.Rubrik, { header: 1 })[0]).toEqual([
      'kriteria', 'skor_1_kurang', 'skor_3_cukup', 'skor_5_baik',
    ]);
    expect(parseRubrikSheet(reloaded)).toEqual({ rubrik: customRubrik, usedDefault: false });
  });

  it('membatasi jumlah baris 20 dan panjang sel 500 karakter dengan peringatan', () => {
    const longText = 'x'.repeat(501);
    const tooManyRows = workbookWithRubrik([
      ['kriteria', 'skor_1_kurang', 'skor_3_cukup', 'skor_5_baik'],
      ...Array.from({ length: 21 }, (_, index) => [
        `Kriteria ${index + 1}`,
        index === 0 ? longText : 'Kurang',
        'Cukup',
        'Baik',
      ]),
    ]);
    const result = parseRubrikSheet(tooManyRows);
    expect(result.rubrik).toHaveLength(20);
    expect(result.rubrik[0].skor1).toHaveLength(500);
    expect(result.warning).toContain('dipotong menjadi 500 karakter');
    expect(result.warning).toContain('melebihi 20 baris');
  });
});
