import type { WorkBook, WorkSheet } from 'xlsx';
import { NilaiSkor, RubrikRow, SkorJawaban } from '../types';
import type { FeedbackRow } from './feedback';
import { RUBRIK_DEFAULT } from './constants';

const SKOR_HEADERS = ['id', 'jawaban', 'kriteria', 'skor'] as const;

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

function cellValue(
  sheet: WorkSheet,
  row: number,
  column: number,
  useFormattedValue = true,
  trim = true,
): string {
  const cell = sheet[`${columnName(column)}${row}`];
  const value = useFormattedValue ? cell?.w ?? cell?.v : cell?.v;
  if (value === undefined || value === null) return '';
  const text = String(value);
  return trim ? text.trim() : text;
}

function feedbackRowKey(row: Pick<FeedbackRow, 'id' | 'jawaban'>): string {
  return JSON.stringify([row.id, row.jawaban]);
}

function isNilaiSkor(value: number): value is NilaiSkor {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function toggleSkor(
  current: SkorJawaban,
  criteria: string,
  value: NilaiSkor,
): SkorJawaban {
  const next = { ...current };
  if (next[criteria] === value) delete next[criteria];
  else next[criteria] = value;
  return next;
}

export function getSkorConsistencyWarnings(
  _row: FeedbackRow,
  _label: string,
  _rubric: RubrikRow[],
  _scores: SkorJawaban,
): string[] {
  return [];
}

export interface PairEvaluation {
  jawaban1Total: number | null;
  jawaban2Total: number | null;
  winner: 'jawaban1' | 'jawaban2' | null;
  isComplete: boolean;
  isTie: boolean;
  isValid: boolean;
  warning: string | null;
}

export function evaluatePair(
  rows: FeedbackRow[],
  skor: Record<string, SkorJawaban>,
  rubrik: RubrikRow[] = RUBRIK_DEFAULT,
): PairEvaluation {
  if (rows.length !== 2) {
    return {
      jawaban1Total: null,
      jawaban2Total: null,
      winner: null,
      isComplete: false,
      isTie: false,
      isValid: false,
      warning: 'Pasangan harus terdiri dari tepat dua jawaban.',
    };
  }

  const totals = rows.map(row => {
    const scores = skor[feedbackRowKey(row)];
    if (!scores || rubrik.length === 0) return null;
    if (!rubrik.every(item => isScore(scores[item.kriteria]))) return null;
    return rubrik.reduce((total, item) => total + scores[item.kriteria]!, 0);
  });

  const [jawaban1Total, jawaban2Total] = totals;
  const isComplete = jawaban1Total !== null && jawaban2Total !== null;
  if (!isComplete) {
    return {
      jawaban1Total,
      jawaban2Total,
      winner: null,
      isComplete: false,
      isTie: false,
      isValid: false,
      warning: 'Lengkapi seluruh skor pada kedua jawaban.',
    };
  }

  if (jawaban1Total === jawaban2Total) {
    return {
      jawaban1Total,
      jawaban2Total,
      winner: null,
      isComplete: true,
      isTie: true,
      isValid: false,
      warning: 'Kedua jawaban memiliki nilai setara. Pasangan belum dapat dinyatakan valid; silakan tinjau kembali penilaian.',
    };
  }

  const winner = jawaban1Total > jawaban2Total ? 'jawaban1' : 'jawaban2';
  const yesRows = rows.filter(row => row.status === 'Yes');
  const noRows = rows.filter(row => row.status === 'No');

  if (yesRows.length !== 1 || noRows.length !== 1) {
    return {
      jawaban1Total,
      jawaban2Total,
      winner,
      isComplete: true,
      isTie: false,
      isValid: false,
      warning: 'Pilih tepat satu Yes dan satu No.',
    };
  }

  const yesIndex = rows.indexOf(yesRows[0]);
  const yesIsWinner = (yesIndex === 0 && winner === 'jawaban1') ||
    (yesIndex === 1 && winner === 'jawaban2');

  if (!yesIsWinner) {
    return {
      jawaban1Total,
      jawaban2Total,
      winner,
      isComplete: true,
      isTie: false,
      isValid: false,
      warning: 'Skor jawaban Yes harus lebih tinggi daripada jawaban No.',
    };
  }

  return {
    jawaban1Total,
    jawaban2Total,
    winner,
    isComplete: true,
    isTie: false,
    isValid: true,
    warning: null,
  };
}

function parseRangeEnd(range: string): { row: number; column: number } | null {
  const end = range.replace(/\$/g, '').split(':').pop() ?? '';
  const match = /^([A-Z]+)(\d+)$/i.exec(end);
  if (!match) return null;
  return { column: columnIndex(match[1].toUpperCase()), row: Number(match[2]) };
}

export function parseSkorSheet(
  workbook: WorkBook,
  rubrik: RubrikRow[],
  feedbackRows: FeedbackRow[],
): { skor: Record<string, SkorJawaban>; warning?: string } {
  const sheet = workbook.Sheets.Skor;
  if (!sheet) return { skor: {} };

  const range = typeof sheet['!ref'] === 'string' ? parseRangeEnd(sheet['!ref']) : null;
  if (!range || range.row < 1 || range.column < 0) {
    return { skor: {}, warning: 'Sheet "Skor" tidak memiliki header yang valid; skor diabaikan.' };
  }

  const headers = Array.from({ length: range.column + 1 }, (_, column) =>
    cellValue(sheet, 1, column).toLowerCase()
  );
  const indices = SKOR_HEADERS.map(header => headers.indexOf(header));
  if (indices.some(index => index < 0)) {
    return { skor: {}, warning: `Header sheet "Skor" tidak lengkap. Header wajib: ${SKOR_HEADERS.join(', ')}; skor diabaikan.` };
  }

  const [idIndex, answerIndex, criteriaIndex, scoreIndex] = indices;
  const feedbackKeys = new Set(feedbackRows.map(feedbackRowKey));
  const criteriaNames = new Set(rubrik.map(row => row.kriteria));
  const skor: Record<string, SkorJawaban> = {};
  let ignored = 0;
  let duplicate = 0;
  const seen = new Set<string>();

  for (let rowNumber = 2; rowNumber <= range.row; rowNumber++) {
    const id = cellValue(sheet, rowNumber, idIndex, true, false);
    const jawaban = cellValue(sheet, rowNumber, answerIndex, true, false);
    const kriteria = cellValue(sheet, rowNumber, criteriaIndex);
    const rawSkor = cellValue(sheet, rowNumber, scoreIndex, false);
    if (!id && !jawaban && !kriteria && !rawSkor) continue;

    const key = feedbackRowKey({ id, jawaban });
    const value = Number(rawSkor);
    if (
      !feedbackKeys.has(key) ||
      !criteriaNames.has(kriteria) ||
      !/^[1-5]$/.test(rawSkor) ||
      !isNilaiSkor(value)
    ) {
      ignored++;
      continue;
    }

    const scoresForAnswer = skor[key] ?? (skor[key] = {});
    const duplicateKey = `${key}\u001f${kriteria}`;
    if (seen.has(duplicateKey)) duplicate++;
    seen.add(duplicateKey);
    scoresForAnswer[kriteria] = value;
  }

  return {
    skor,
    ...((ignored || duplicate) ? {
      warning: [
        ignored ? `${ignored} baris pada sheet "Skor" diabaikan karena ID/jawaban, kriteria, atau nilai skor tidak valid.` : '',
        duplicate ? `${duplicate} baris duplikat pada sheet "Skor" diabaikan dengan menggunakan nilai terakhir.` : '',
      ].filter(Boolean).join(' '),
    } : {}),
  };
}

function isScore(value: unknown): value is NilaiSkor {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function buildSkorSheet(
  skor: Record<string, SkorJawaban>,
  rubrik: RubrikRow[],
  rows: FeedbackRow[],
): WorkSheet {
  const values: Array<Array<string | number>> = [[...SKOR_HEADERS]];
  for (const row of rows) {
    const valuesForAnswer = skor[feedbackRowKey(row)];
    for (const rubricRow of rubrik) {
      const score = valuesForAnswer?.[rubricRow.kriteria];
      if (isScore(score)) values.push([row.id, row.jawaban, rubricRow.kriteria, score]);
    }
  }

  const sheet: WorkSheet = { '!ref': `A1:D${values.length}` };
  values.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    const address = `${columnName(columnIndex)}${rowIndex + 1}`;
    if (rowIndex > 0 && columnIndex === 3) {
      sheet[address] = { t: 'n', v: value as number };
    } else {
      sheet[address] = { t: 's', v: String(value) };
    }
  }));
  return sheet;
}
