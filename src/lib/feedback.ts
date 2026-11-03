import { muatXlsx } from './xlsxLoader';
import { hash } from './blind';
import { ANOTASI_SKOR_WAJIB, RUBRIK_DEFAULT } from './constants';
import { parseRubrikSheet } from './rubrik';
import { parseSkorSheet } from './skor';
import { RubrikRow, SkorJawaban } from '../types';

export const FEEDBACK_HEADERS = ['id', 'kelas', 'pertanyaan', 'context', 'jawaban', 'status'] as const;
export const FEEDBACK_REQUIRED_HEADERS = ['id', 'pertanyaan', 'jawaban', 'status'] as const;

export interface FeedbackRow {
  id: string;
  kelas: string;
  pertanyaan: string;
  context: string;
  jawaban: string;
  status: '' | 'Yes' | 'No';
}

export interface FeedbackGroup {
  id: string;
  rows: FeedbackRow[];
}

export interface FeedbackParseResult {
  rows?: FeedbackRow[];
  groups?: FeedbackGroup[];
  warnings: string[];
  rubrik?: RubrikRow[];
  rubrikWarning?: string;
  skor?: Record<string, SkorJawaban>;
  skorWarning?: string;
  error?: string;
}

const headerKey = (value: unknown) => String(value ?? '').trim().toLowerCase();

export function feedbackRowKey(row: Pick<FeedbackRow, 'id' | 'jawaban'>): string {
  return JSON.stringify([row.id, row.jawaban]);
}

export function groupFeedbackRows(rows: FeedbackRow[]): FeedbackGroup[] {
  const groups = new Map<string, FeedbackRow[]>();
  for (const row of rows) {
    const current = groups.get(row.id) ?? [];
    current.push(row);
    groups.set(row.id, current);
  }
  return Array.from(groups, ([id, groupedRows]) => ({ id, rows: groupedRows }));
}

export function stableFeedbackDisplayOrder(group: FeedbackGroup): FeedbackRow[] {
  return hash(group.id, 'feedback-') % 2 === 1 ? [...group.rows].reverse() : [...group.rows];
}

export function feedbackGroupComplete(
  group: FeedbackGroup,
  skor: Record<string, SkorJawaban> = {},
  rubrik: RubrikRow[] = RUBRIK_DEFAULT,
): boolean {
  return Boolean(group.id.trim()) &&
    group.rows.length === 2 &&
    group.rows.every(row =>
      row.jawaban.trim() !== '' &&
      (row.status === 'Yes' || row.status === 'No') &&
      (!ANOTASI_SKOR_WAJIB || rubrik.every(criteria => {
        const score = skor[feedbackRowKey(row)]?.[criteria.kriteria];
        return typeof score === 'number' && Number.isInteger(score) && score >= 1 && score <= 5;
      }))
    );
}

export async function parseFeedbackFile(file: File): Promise<FeedbackParseResult> {
  try {
    const XLSX = await muatXlsx();
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: false });
    const isCsv = /\.csv$/i.test(file.name);
    let rubrikResult: ReturnType<typeof parseRubrikSheet>;
    if (isCsv) {
      rubrikResult = { rubrik: RUBRIK_DEFAULT, usedDefault: true };
    } else {
      try {
        rubrikResult = parseRubrikSheet(workbook);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Format sheet tidak valid.';
        rubrikResult = {
          rubrik: RUBRIK_DEFAULT,
          usedDefault: true,
          warning: `Gagal membaca sheet "Rubrik": ${reason}; rubrik default digunakan.`,
        };
      }
    }
    const sheetName = isCsv ? workbook.SheetNames[0] : 'Feedback';
    const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;

    if (!sheet) {
      return { warnings: [], error: 'File XLSX harus memiliki sheet bernama "Feedback".' };
    }

    const values = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    });
    const header = values[0]?.map(headerKey) ?? [];
    const missing = FEEDBACK_REQUIRED_HEADERS.filter(required => !header.includes(required));
    if (missing.length) {
      return {
        warnings: [],
        error: `Kolom wajib tidak ditemukan: ${missing.join(', ')}. Kolom wajib: id, pertanyaan, jawaban, status; kelas dan context dipertahankan jika tersedia.`,
      };
    }

    const columnIndex = Object.fromEntries(header.map((name, index) => [name, index]));
    const rows = values.slice(1)
      .filter(row => row.some(value => String(value ?? '').trim() !== ''))
      .map(row => {
        const get = (name: typeof FEEDBACK_HEADERS[number]) => {
          const index = columnIndex[name];
          return index === undefined ? '' : String(row[index] ?? '');
        };
        const rawStatus = get('status').trim().toLowerCase();
        return {
          id: get('id'),
          kelas: get('kelas'),
          pertanyaan: get('pertanyaan'),
          context: get('context'),
          jawaban: get('jawaban'),
          status: rawStatus === 'yes' ? 'Yes' : rawStatus === 'no' ? 'No' : '',
        } satisfies FeedbackRow;
      });

    const groups = groupFeedbackRows(rows);
    let skorResult: ReturnType<typeof parseSkorSheet>;
    if (isCsv) {
      skorResult = { skor: {} };
    } else {
      try {
        skorResult = parseSkorSheet(workbook, rubrikResult.rubrik, rows);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Format sheet tidak valid.';
        skorResult = {
          skor: {},
          warning: `Gagal membaca sheet "Skor": ${reason}; skor diabaikan.`,
        };
      }
    }
    const warnings = groups
      .flatMap(group => [
        ...(group.id.trim() ? [] : [`Baris dengan ID kosong ditemukan (${group.rows.length} baris).`]),
        ...(group.rows.length === 2 ? [] : [`ID "${group.id || '(kosong)'}" memiliki ${group.rows.length} baris, seharusnya tepat 2.`]),
      ]);

    return {
      rows,
      groups,
      warnings,
      rubrik: rubrikResult.rubrik,
      rubrikWarning: rubrikResult.warning,
      skor: skorResult.skor,
      skorWarning: skorResult.warning,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Format file tidak dapat dibaca.';
    return { warnings: [], error: `Gagal membaca template Feedback: ${reason}` };
  }
}

export function hasClearFeedbackPreference(
  group: FeedbackGroup,
  skor: Record<string, SkorJawaban> = {},
  rubrik: RubrikRow[] = RUBRIK_DEFAULT,
): boolean {
  return feedbackGroupComplete(group, skor, rubrik) && group.rows[0].status !== group.rows[1].status;
}
