import { renderToStaticMarkup } from 'react-dom/server';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnotasiGuruPage } from '../AnotasiGuruPage';
import { EvaluasiGuruPage } from '../EvaluasiGuruPage';
import { RUBRIK_DEFAULT } from '../../lib/constants';
import { getSkorConsistencyWarnings } from '../../lib/skor';
import { toggleSkor } from '../../lib/skor';
import { SkorKriteriaRow } from '../../components/SkorKriteriaRow';
import { NilaiSkor, RubrikRow, SkorJawaban } from '../../types';

const feedbackRows = [
  { id: 'PJOK_0315', kelas: '3', pertanyaan: 'Apa manfaat pemanasan?', context: 'Materi PJOK.', jawaban: 'Jawaban pertama.', status: '' },
  { id: 'PJOK_0315', kelas: '3', pertanyaan: 'Apa manfaat pemanasan?', context: 'Materi PJOK.', jawaban: 'Jawaban kedua.', status: '' },
];

const followingTaskRows = [
  ...feedbackRows,
  { id: 'PJOK_0316', kelas: '3', pertanyaan: 'Apa manfaat pendinginan?', context: 'Materi PJOK.', jawaban: 'Jawaban ketiga.', status: '' },
  { id: 'PJOK_0316', kelas: '3', pertanyaan: 'Apa manfaat pendinginan?', context: 'Materi PJOK.', jawaban: 'Jawaban keempat.', status: '' },
];

function completeScores(rows: typeof followingTaskRows, score = 5): Record<string, Record<string, number>> {
  return Object.fromEntries(rows.map(row => [
    JSON.stringify([row.id, row.jawaban]),
    Object.fromEntries(RUBRIK_DEFAULT.map(criteria => [criteria.kriteria, score])),
  ]));
}

const paket = {
  versi: 2,
  dibuat: '2026-10-27T00:00:00.000Z',
  set: 'final_test' as const,
  siklus: 1,
  tugas: [{
    id: 'PJOK_0315',
    kelas: 3,
    pertanyaan: 'Apa manfaat pemanasan?',
    acuan: 'Menyiapkan tubuh.',
    context: 'Materi PJOK.',
    varian: 'fixed',
    sft: 'Jawaban SFT.',
    dpo: 'Jawaban DPO.',
    identik: false,
  }],
};

describe('tampilan mode Ruang Guru', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => store.set(key, String(value))),
      removeItem: vi.fn((key: string) => store.delete(key)),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menampilkan skor dan rubrik yang dimuat di mode anotasi', () => {
    localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify(feedbackRows));
    localStorage.setItem('qb_guru_anotasi_rubrik_v1', JSON.stringify([{
      kriteria: 'Rubrik dari file',
      skor1: 'Deskripsi kurang dari file',
      skor3: 'Deskripsi cukup dari file',
      skor5: 'Deskripsi baik dari file',
    }]));
    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify({
      '["PJOK_0315","Jawaban pertama."]': { 'Rubrik dari file': 3 },
    }));
    const markup = renderToStaticMarkup(
      <AnotasiGuruPage warningMessages={[]} />
    );

    expect(markup).toContain('Rubrik penilaian');
    expect(markup).toContain('Rubrik dari file');
    expect(markup).toContain('Deskripsi kurang dari file');
    expect(markup).toContain('Skala: 1 = kurang, 3 = cukup, 5 = baik.');
    expect(markup).toContain('Rubrik dari file skor 3');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('Yes');
    expect(markup).toContain('No');
    expect(markup).toContain('aria-label="Rubrik dari file untuk Jawaban');
    expect(markup).toMatch(/aria-label="Rubrik dari file skor [1-5]"/);
    expect(markup).not.toContain('<textarea');
  });

  it('merender rubrik dengan tiga atau tujuh kriteria', () => {
    for (const count of [3, 7]) {
      const rubric = Array.from({ length: count }, (_, index) => ({
        kriteria: `Kriteria ${index + 1}`,
        skor1: `Kurang ${index + 1}`,
        skor3: `Cukup ${index + 1}`,
        skor5: `Baik ${index + 1}`,
      }));
      localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify(feedbackRows));
      localStorage.setItem('qb_guru_anotasi_rubrik_v1', JSON.stringify(rubric));
      const markup = renderToStaticMarkup(<AnotasiGuruPage warningMessages={[]} />);
      expect(markup).toContain(`Kriteria ${count}`);
      expect(markup).not.toContain(`Kriteria ${count + 1}`);
    }
  });

  it('menampilkan peringatan konsistensi Yes/No dan skor yang bertentangan', () => {
    const yesRow = { ...feedbackRows[0], status: 'Yes' as const };
    const noRow = { ...feedbackRows[1], status: 'No' as const };
    const rubric = RUBRIK_DEFAULT.slice(0, 2);
    expect(getSkorConsistencyWarnings(yesRow, 'Jawaban 1', rubric, {
      [rubric[0].kriteria]: 1,
    })[0]).toContain(rubric[0].kriteria);
    expect(getSkorConsistencyWarnings(noRow, 'Jawaban 2', rubric, {
      [rubric[0].kriteria]: 4,
      [rubric[1].kriteria]: 5,
    })[0]).toContain('ditandai No');
    expect(getSkorConsistencyWarnings(yesRow, 'Jawaban 1', rubric, {
      [rubric[0].kriteria]: 4,
    })).toEqual([]);
    expect(getSkorConsistencyWarnings(noRow, 'Jawaban 2', rubric, {
      [rubric[0].kriteria]: 4,
    })).toEqual([]);
  });

  it('menampilkan dan menghilangkan banner peringatan konsistensi pada UI', () => {
    const rubric = [{ kriteria: 'Ketepatan Materi', skor1: 'Kurang', skor3: 'Cukup', skor5: 'Baik' }];
    localStorage.setItem('qb_guru_anotasi_rubrik_v1', JSON.stringify(rubric));
    localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify([
      { ...feedbackRows[0], status: 'Yes' },
      { ...feedbackRows[1], status: 'No' },
    ]));
    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify({
      '["PJOK_0315","Jawaban pertama."]': { 'Ketepatan Materi': 1 },
      '["PJOK_0315","Jawaban kedua."]': { 'Ketepatan Materi': 5 },
    }));

    const warningMarkup = renderToStaticMarkup(<AnotasiGuruPage warningMessages={[]} />);
    expect(warningMarkup).toContain('ditandai Yes');
    expect(warningMarkup).toContain('ditandai No');

    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify({
      '["PJOK_0315","Jawaban pertama."]': { 'Ketepatan Materi': 4 },
      '["PJOK_0315","Jawaban kedua."]': { 'Ketepatan Materi': 3 },
    }));
    const clearMarkup = renderToStaticMarkup(<AnotasiGuruPage warningMessages={[]} />);
    expect(clearMarkup).not.toContain('ditandai Yes');
    expect(clearMarkup).not.toContain('ditandai No');
  });

  it('membiarkan Berikutnya aktif untuk tugas lengkap saat ada tugas berikutnya', () => {
    const completedRows = followingTaskRows.map((row, index) => ({
      ...row,
      status: index === 0 || index === 2 ? 'Yes' : 'No',
    }));
    localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify(completedRows));
    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify(completeScores(followingTaskRows)));

    const markup = renderToStaticMarkup(<AnotasiGuruPage warningMessages={[]} />);
    const nextButton = markup.match(/<button[^>]*>Berikutnya<\/button>/)?.[0];
    expect(markup).toContain('Tugas 1 dari 2');
    expect(nextButton).toBeDefined();
    expect(nextButton).not.toContain('disabled=""');
  });

  it.each([
    ['Yes', 'Yes'],
    ['No', 'No'],
  ] as const)('peringatan pasangan %s/%s tidak menonaktifkan Berikutnya', (firstStatus, secondStatus) => {
    const completedRows = followingTaskRows.map((row, index) => ({
      ...row,
      status: index < 2 ? (index === 0 ? firstStatus : secondStatus) : 'Yes',
    }));
    localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify(completedRows));
    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify(completeScores(followingTaskRows)));

    const markup = renderToStaticMarkup(<AnotasiGuruPage warningMessages={[]} />);
    const nextButton = markup.match(/<button[^>]*>Berikutnya<\/button>/)?.[0];
    expect(markup).toContain('Tugas 1 dari 2');
    expect(markup).toContain('Pasangan ini tidak menghasilkan preferensi yang jelas.');
    if (firstStatus === 'No') expect(markup).toContain('ditandai No');
    expect(nextButton).toBeDefined();
    expect(nextButton).not.toContain('disabled=""');
  });

  it('menonaktifkan Berikutnya hanya pada tugas terakhir dan tetap menyediakan ekspor', () => {
    const onlyTask = feedbackRows.map(row => ({ ...row, status: 'Yes' }));
    localStorage.setItem('qb_guru_anotasi_rows_v1', JSON.stringify(onlyTask));
    localStorage.setItem('qb_guru_anotasi_skor_v1', JSON.stringify(completeScores(onlyTask)));
    localStorage.setItem('qb_guru_profil_v1', JSON.stringify({ kode: 'G01', kelas: [3], hanya: true }));

    const markup = renderToStaticMarkup(<AnotasiGuruPage warningMessages={[]} />);
    const nextButton = markup.match(/<button[^>]*>Berikutnya<\/button>/)?.[0];
    const exportButton = markup.match(/<button[^>]*>[\s\S]*?Simpan hasil saya \(\.xlsx\)[\s\S]*?<\/button>/)?.[0];
    expect(markup).toContain('Tugas 1 dari 1');
    expect(nextButton).toContain('disabled=""');
    expect(markup).toContain('Ini tugas terakhir pada daftar yang ditampilkan.');
    expect(exportButton).toBeDefined();
    expect(exportButton).not.toContain('disabled=""');
  });

  it('memilih skor dari kotak, membatalkannya saat diklik ulang, dan menampilkan deskripsi terpilih', () => {
    const criteria: RubrikRow = {
      kriteria: 'Ketepatan Materi',
      skor1: 'Kurang',
      skor3: 'Cukup',
      skor5: 'Baik',
    };
    let scores: SkorJawaban = {};
    const renderRow = () => SkorKriteriaRow({
      criteria,
      score: scores[criteria.kriteria],
      answerLabel: 'Jawaban 1',
      onSelect: (value: NilaiSkor) => {
        scores = toggleSkor(scores, criteria.kriteria, value);
      },
    }) as ReactElement<{ children: ReactNode }>;
    const getScoreButton = (score: number) => {
      const rootChildren = renderRow().props.children as ReactElement<{ children: ReactNode }>[];
      const buttonGroup = rootChildren[1];
      const buttons = buttonGroup.props.children as ReactElement<{
        onClick: (event: MouseEvent<HTMLButtonElement>) => void;
      }>[];
      return buttons[score - 1];
    };

    getScoreButton(3).props.onClick({} as MouseEvent<HTMLButtonElement>);
    expect(scores[criteria.kriteria]).toBe(3);
    expect(renderToStaticMarkup(renderRow())).toContain('Cukup');
    getScoreButton(3).props.onClick({} as MouseEvent<HTMLButtonElement>);
    expect(scores).toEqual({});
    expect(renderToStaticMarkup(renderRow())).not.toContain('Cukup');
  });

  it('menampilkan ScoreRow, keputusan A/B, dan komentar di mode evaluasi', () => {
    localStorage.setItem('qb_guru_anotasi_rubrik_v1', JSON.stringify([{
      kriteria: 'Rubrik anotasi khusus',
      skor1: 'Bukan rubrik evaluasi',
      skor3: 'Bukan rubrik evaluasi',
      skor5: 'Bukan rubrik evaluasi',
    }]));
    const markup = renderToStaticMarkup(
      <EvaluasiGuruPage paket={paket} />
    );

    expect(markup).toContain('aria-label="Ketepatan Materi skor 1"');
    expect(markup).toContain('Keputusan keseluruhan');
    expect(markup).toContain('Komentar (Wajib)');
    expect(markup).toContain('<textarea');
    expect(markup).not.toContain('Rubrik anotasi khusus');
    expect(markup).toContain(RUBRIK_DEFAULT[0].kriteria);
  });
});
