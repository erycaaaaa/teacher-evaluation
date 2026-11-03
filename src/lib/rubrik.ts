import type { WorkBook, WorkSheet } from 'xlsx';
import { RubrikRow } from '../types';
import { RUBRIK_DEFAULT } from './constants';

const RUBRIK_HEADERS = ['kriteria', 'skor_1_kurang', 'skor_3_cukup', 'skor_5_baik'] as const;
const HEADER_ALIASES: readonly (readonly string[])[] = [
  ['kriteria'],
  ['skor_1_kurang', 'skor 1'],
  ['skor_3_cukup', 'skor 3'],
  ['skor_5_baik', 'skor 5'],
] as const;
const MAX_RUBRIK_ROWS = 20;
const MAX_CELL_LENGTH = 500;

function columnName(index: number): string {
  let name = '';
  let value = index + 1;
  while (value > 0) {
    value--;
    name = String.fromCharCode(65 + value % 26) + name;
    value = Math.floor(value / 26);
  }
  return name;
}

function columnIndex(name: string): number {
  return [...name].reduce((index, character) =>
    index * 26 + character.charCodeAt(0) - 64, 0) - 1;
}

function cellValue(sheet: WorkSheet, row: number, column: number): string {
  const address = `${columnName(column)}${row}`;
  return String(sheet[address]?.v ?? '').trim();
}

function parseRangeEnd(range: string): { row: number; column: number } | null {
  const end = range.replace(/\$/g, '').split(':').pop() ?? '';
  const match = /^([A-Z]+)(\d+)$/i.exec(end);
  if (!match) return null;
  return { column: columnIndex(match[1].toUpperCase()), row: Number(match[2]) };
}

export function parseRubrikSheet(
  workbook: WorkBook,
): { rubrik: RubrikRow[]; usedDefault: boolean; warning?: string } {
  const sheet = workbook.Sheets.Rubrik;
  if (!sheet) return { rubrik: RUBRIK_DEFAULT, usedDefault: true };

  const range = typeof sheet['!ref'] === 'string' ? parseRangeEnd(sheet['!ref']) : null;
  if (!range || range.row < 1 || range.column < 0) {
    return {
      rubrik: RUBRIK_DEFAULT,
      usedDefault: true,
      warning: 'Sheet "Rubrik" tidak memiliki header atau baris rubrik yang valid; rubrik default digunakan.',
    };
  }

  const headers = Array.from({ length: range.column + 1 }, (_, column) =>
    cellValue(sheet, 1, column).toLowerCase().replace(/\s+/g, ' ')
  );
  const indices = HEADER_ALIASES.map(aliases => headers.findIndex(header => aliases.includes(header)));
  if (indices.some(index => index < 0)) {
    return {
      rubrik: RUBRIK_DEFAULT,
      usedDefault: true,
      warning: `Header sheet "Rubrik" tidak lengkap. Header wajib: ${RUBRIK_HEADERS.join(', ')}; rubrik default digunakan.`,
    };
  }

  const [kriteriaIndex, skor1Index, skor3Index, skor5Index] = indices;
  const warnings: string[] = [];
  const rubrik = Array.from({ length: Math.min(range.row - 1, MAX_RUBRIK_ROWS) }, (_, index) => {
    const row = index + 2;
    const readCell = (column: number) => {
      const value = cellValue(sheet, row, column);
      if (value.length > MAX_CELL_LENGTH) {
        warnings.push(`Nilai sheet "Rubrik" pada baris ${row} dipotong menjadi ${MAX_CELL_LENGTH} karakter.`);
        return value.slice(0, MAX_CELL_LENGTH);
      }
      return value;
    };
    return {
      kriteria: readCell(kriteriaIndex),
      skor1: readCell(skor1Index),
      skor3: readCell(skor3Index),
      skor5: readCell(skor5Index),
    };
  }).filter(row => row.kriteria !== '');
  if (range.row - 1 > MAX_RUBRIK_ROWS) {
    warnings.push(`Sheet "Rubrik" melebihi ${MAX_RUBRIK_ROWS} baris; baris tambahan diabaikan.`);
  }

  if (rubrik.length === 0) {
    return {
      rubrik: RUBRIK_DEFAULT,
      usedDefault: true,
      warning: 'Sheet "Rubrik" tidak memiliki baris dengan kriteria yang valid; rubrik default digunakan.',
    };
  }

  return { rubrik, usedDefault: false, ...(warnings.length ? { warning: [...new Set(warnings)].join(' ') } : {}) };
}

export function buildRubrikSheet(rubrik: RubrikRow[]): WorkSheet {
  const values = [
    [...RUBRIK_HEADERS],
    ...rubrik.map(row => [row.kriteria, row.skor1, row.skor3, row.skor5]),
  ];
  const sheet: WorkSheet = { '!ref': `A1:D${values.length}` };
  values.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    const address = `${columnName(columnIndex)}${rowIndex + 1}`;
    sheet[address] = { t: 's', v: String(value).trim() };
  }));
  return sheet;
}
