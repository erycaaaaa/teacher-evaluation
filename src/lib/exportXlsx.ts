import { AuditTrailEntry, EvaluasiGuruRow, RubrikRow, SkorJawaban } from '../types';
import { FEEDBACK_HEADERS, FeedbackRow } from './feedback';
import { muatXlsx } from './xlsxLoader';
import { RUBRIK_DEFAULT } from './constants';
import { buildRubrikSheet } from './rubrik';
import { buildSkorSheet } from './skor';

export const EVALUASI_HEADERS = [
  'ID', 'Kode Guru', 'Kelas Dikuasai Guru', 'Kelas', 'Pertanyaan',
  'Jawaban Acuan', 'Varian Context', 'Jawaban SFT', 'Jawaban DPO',
  'Penempatan A', 'Penempatan B',
  'SFT - Ketepatan Materi', 'SFT - Relevansi', 'SFT - Kejelasan Bahasa',
  'SFT - Kesesuaian Usia', 'SFT - Keamanan',
  'DPO - Ketepatan Materi', 'DPO - Relevansi', 'DPO - Kejelasan Bahasa',
  'DPO - Kesesuaian Usia', 'DPO - Keamanan',
  'Keputusan', 'Komentar', 'Waktu', 'Identik', 'Set', 'Siklus',
] as const;

export async function buildHasilGuruWorkbook(
  rows: EvaluasiGuruRow[],
  auditList: AuditTrailEntry[],
  _kodeGuru?: string,
): Promise<any> {
  const XLSX = await muatXlsx();
  const workbook = XLSX.utils.book_new();
  const evaluations = rows.map(row => EVALUASI_HEADERS.map(header => row[header]));
  const evaluationSheet = XLSX.utils.aoa_to_sheet([
    [...EVALUASI_HEADERS],
    ...evaluations,
  ]);
  XLSX.utils.book_append_sheet(workbook, evaluationSheet, 'Evaluasi_Guru');

  const auditRows = auditList.length
    ? auditList.map(entry => ({
        ID: entry.id,
        Keputusan: entry.keputusan,
        Komentar: entry.komentar,
        'Skor SFT': entry.skorSFT.map(score => score ?? '').join(','),
        'Skor DPO': entry.skorDPO.map(score => score ?? '').join(','),
        Waktu: entry.waktu,
        Diarsipkan: entry.diarsipkan,
      }))
    : [{ Info: 'Belum ada revisi' }];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(auditRows), 'Audit_Trail');
  return workbook;
}

export async function eksporHasilGuru(
  rows: EvaluasiGuruRow[],
  auditList: AuditTrailEntry[],
  kodeGuru: string
): Promise<void> {
  const XLSX = await muatXlsx();
  const sanitizedKode = (kodeGuru || 'anonim').replace(/[^\w-]/g, '_');
  const workbook = await buildHasilGuruWorkbook(rows, auditList);
  XLSX.writeFile(workbook, `hasil_guru_${sanitizedKode}.xlsx`);
}

export async function buildFeedbackWorkbook(
  rows: FeedbackRow[],
  rubrik: RubrikRow[] = RUBRIK_DEFAULT,
  skor: Record<string, SkorJawaban> = {},
): Promise<any> {
  const XLSX = await muatXlsx();
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    [...FEEDBACK_HEADERS],
    ...rows.map(row => [
      String(row.id),
      row.kelas,
      row.pertanyaan,
      row.context,
      row.jawaban,
      row.status,
    ]),
  ]);
  worksheet['!cols'] = [
    { wch: 16 }, { wch: 8 }, { wch: 45 }, { wch: 40 }, { wch: 45 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');
  XLSX.utils.book_append_sheet(workbook, buildRubrikSheet(rubrik), 'Rubrik');
  const scoreSheet = buildSkorSheet(skor, rubrik, rows);
  if (scoreSheet.A2) XLSX.utils.book_append_sheet(workbook, scoreSheet, 'Skor');
  return workbook;
}

export async function eksporFeedbackGuru(
  rows: FeedbackRow[],
  kodeGuru: string,
  rubrik: RubrikRow[] = RUBRIK_DEFAULT,
  skor: Record<string, SkorJawaban> = {},
): Promise<void> {
  const XLSX = await muatXlsx();
  const sanitizedKode = (kodeGuru || 'anonim').replace(/[^\w-]/g, '_');
  const workbook = await buildFeedbackWorkbook(rows, rubrik, skor);
  XLSX.writeFile(workbook, `feedback_guru_${sanitizedKode}.xlsx`);
}
