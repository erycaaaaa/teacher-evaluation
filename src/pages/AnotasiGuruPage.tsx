import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Download } from 'lucide-react';
import {
  ANOTASI_YES_NO_RULE,
  RUBRIK_DEFAULT,
} from '../lib/constants';
import {
  FeedbackGroup,
  FeedbackRow,
  feedbackGroupComplete,
  feedbackRowKey,
  groupFeedbackRows,
  hasClearFeedbackPreference,
  stableFeedbackDisplayOrder,
} from '../lib/feedback';
import { extractKelasNum } from '../lib/kelas';
import { eksporFeedbackGuru } from '../lib/exportXlsx';
import { RubrikTable } from '../components/RubrikTable';
import { ProgressBoard } from '../components/ProgressBoard';
import { SkorKriteriaRow } from '../components/SkorKriteriaRow';
import { getSkorConsistencyWarnings, toggleSkor } from '../lib/skor';
import { RubrikRow, SkorJawaban, NilaiSkor } from '../types';

const LS_ROWS = 'qb_guru_anotasi_rows_v1';
const LS_RUBRIK = 'qb_guru_anotasi_rubrik_v1';
const LS_SKOR = 'qb_guru_anotasi_skor_v1';
const LS_PROFILE = 'qb_guru_profil_v1';
const LS_EXPORT = 'qb_guru_anotasi_export_snapshot_v1';

interface GuruProfile {
  kode: string;
  kelas: number[];
  hanya: boolean;
}

function loadStoredRows(): FeedbackRow[] {
  try {
    const saved = localStorage.getItem(LS_ROWS);
    return saved ? JSON.parse(saved) as FeedbackRow[] : [];
  } catch (error) {
    console.error('Gagal memuat autosave anotasi:', error);
    return [];
  }
}

function loadStoredRubrik(): RubrikRow[] {
  try {
    const saved = localStorage.getItem(LS_RUBRIK);
    return saved ? JSON.parse(saved) as RubrikRow[] : RUBRIK_DEFAULT;
  } catch (error) {
    console.error('Gagal memuat rubrik anotasi:', error);
    return RUBRIK_DEFAULT;
  }
}

function loadStoredSkor(): Record<string, SkorJawaban> {
  try {
    const saved = localStorage.getItem(LS_SKOR);
    return saved ? JSON.parse(saved) as Record<string, SkorJawaban> : {};
  } catch (error) {
    console.error('Gagal memuat skor anotasi:', error);
    return {};
  }
}

export const AnotasiGuruPage: React.FC<{ warningMessages: string[] }> = ({ warningMessages }) => {
  const [rows, setRows] = useState<FeedbackRow[]>(loadStoredRows);
  const [rubrik] = useState<RubrikRow[]>(loadStoredRubrik);
  const [skor, setSkor] = useState<Record<string, SkorJawaban>>(loadStoredSkor);
  const [profile, setProfile] = useState<GuruProfile>(() => {
    try {
      const saved = localStorage.getItem(LS_PROFILE);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        kode: String(parsed.kode ?? '').slice(0, 12),
        kelas: Array.isArray(parsed.kelas)
          ? parsed.kelas.filter((kelas: number) => Number.isInteger(kelas) && kelas >= 1 && kelas <= 6)
          : [],
        hanya: parsed.hanya !== false,
      };
    } catch (error) {
      console.error('Gagal memuat profil guru:', error);
      return { kode: '', kelas: [] as number[], hanya: true };
    }
  });
  const [taskIndex, setTaskIndex] = useState(0);
  const [rubrikTerbuka, setRubrikTerbuka] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportSnapshot, setExportSnapshot] = useState<string | null>(() =>
    localStorage.getItem(LS_EXPORT)
  );

  const groups = useMemo(() => groupFeedbackRows(rows), [rows]);
  const visibleGroups = useMemo(() => {
    if (!profile.hanya || profile.kelas.length === 0) return groups;
    return groups.filter(group => profile.kelas.includes(extractKelasNum(group.rows[0]?.kelas) ?? -1));
  }, [groups, profile.hanya, profile.kelas]);
  const activeGroup = visibleGroups[taskIndex];
  const groupsWithId = groups.filter(group => group.id.trim() !== '');
  const completedCount = groupsWithId.filter(group => feedbackGroupComplete(group, skor, rubrik)).length;

  useEffect(() => {
    if (rows.length) localStorage.setItem(LS_ROWS, JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem(LS_SKOR, JSON.stringify(skor));
  }, [skor]);

  useEffect(() => {
    setTaskIndex(index => Math.min(index, Math.max(visibleGroups.length - 1, 0)));
  }, [visibleGroups.length]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      const hasRatings = rows.some(row => row.status === 'Yes' || row.status === 'No') ||
        Object.keys(skor).length > 0;
      const snapshot = JSON.stringify({ rows, skor, rubrik });
      if (hasRatings && snapshot !== exportSnapshot) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [rows, skor, rubrik, exportSnapshot]);

  const boardItems = [1, 2, 3, 4, 5, 6].map(kelas => {
    const classGroups = groupsWithId.filter(group => extractKelasNum(group.rows[0]?.kelas) === kelas);
    return {
      kelas,
      totalTugas: classGroups.length,
      tugasDinilai: classGroups.filter(group => feedbackGroupComplete(group, skor, rubrik)).length,
      isMyClass: profile.kelas.includes(kelas),
    };
  });

  const updateProfile = (next: GuruProfile) => {
    setProfile(next);
    localStorage.setItem(LS_PROFILE, JSON.stringify(next));
  };

  const setStatus = (answer: FeedbackRow, status: 'Yes' | 'No') => {
    const key = feedbackRowKey(answer);
    setRows(current => current.map(row =>
      feedbackRowKey(row) === key ? { ...row, status } : row
    ));
  };

  const setAnswerScore = (answer: FeedbackRow, criteria: string, value: NilaiSkor) => {
    const key = feedbackRowKey(answer);
    setSkor(current => {
      const next = { ...current };
      const answerScores = toggleSkor(next[key] ?? {}, criteria, value);
      if (Object.keys(answerScores).length) next[key] = answerScores;
      else delete next[key];
      return next;
    });
  };

  const saveResults = async () => {
    setError(null);
    setSuccess(null);
    if (!profile.kode.trim()) {
      setError('Isi kode guru terlebih dahulu agar hasil dapat dikenali.');
      return;
    }
    setIsExporting(true);
    try {
      await eksporFeedbackGuru(rows, profile.kode, rubrik, skor);
      const snapshot = JSON.stringify({ rows, skor, rubrik });
      localStorage.setItem(LS_EXPORT, snapshot);
      setExportSnapshot(snapshot);
      setSuccess(`Hasil anotasi berhasil disimpan ke feedback_guru_${profile.kode.replace(/[^\w-]/g, '_')}.xlsx.`);
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : 'Terjadi kesalahan saat membuat file.';
      setError(`Gagal membuat file Excel: ${reason}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      <section className="p-5 rounded-card bg-white border border-bd shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="min-w-[200px]">
            <span className="block text-xs font-bold uppercase tracking-wider text-mute mb-1.5">Kode Guru (Anonim)</span>
            <input
              value={profile.kode}
              maxLength={12}
              onChange={event => updateProfile({ ...profile, kode: event.target.value.slice(0, 12) })}
              placeholder="Contoh: G01"
              className="w-full px-3 py-2 min-h-[44px] rounded-btn border border-bdi text-sm"
            />
          </label>
          <div className="flex-1 min-w-[280px]">
            <span className="block text-xs font-bold uppercase tracking-wider text-mute mb-1.5">Kelas yang Saya Kuasai / Ditugaskan</span>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6].map(kelas => {
                const selected = profile.kelas.includes(kelas);
                return (
                  <button
                    key={kelas}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateProfile({
                      ...profile,
                      kelas: selected
                        ? profile.kelas.filter(value => value !== kelas)
                        : [...profile.kelas, kelas].sort(),
                    })}
                    className={`min-h-[44px] px-3.5 py-1.5 rounded-btn text-xs font-bold border ${selected ? 'bg-tint text-pri border-2 border-pri' : 'bg-white text-tx border-bdi'}`}
                  >
                    Kelas {kelas}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            aria-pressed={profile.hanya}
            onClick={() => updateProfile({ ...profile, hanya: !profile.hanya })}
            className="min-h-[44px] px-4 py-2 rounded-btn text-xs font-bold border bg-white text-tx border-bdi"
          >
            Hanya tampilkan kelas saya
          </button>
          <button
            type="button"
            disabled={isExporting || rows.length === 0}
            onClick={saveResults}
            className="px-4 py-2 min-h-[44px] rounded-btn border border-pri bg-pri text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Memproses...' : 'Simpan hasil saya (.xlsx)'}
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-xs font-semibold text-danger">{error}</p>}
        {success && <p role="status" className="mt-3 text-xs font-semibold text-pri">{success}</p>}
        {warningMessages.length > 0 && (
          <div role="status" className="mt-3 p-3 rounded-card bg-amber-50 border border-amber-300 text-amber-900 text-xs">
            <strong>Periksa pasangan ID berikut (peringatan tidak menghalangi anotasi):</strong>
            <ul className="list-disc pl-5 mt-1">{warningMessages.map(message => <li key={message}>{message}</li>)}</ul>
          </div>
        )}
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">
            Progres Per Kelas ({completedCount} / {groupsWithId.length} tugas dinilai)
          </div>
          <ProgressBoard items={boardItems} />
        </div>
      </section>

      {activeGroup ? (
        <FeedbackTask
          group={activeGroup}
          index={taskIndex}
          total={visibleGroups.length}
          rubrik={rubrik}
          rubrikTerbuka={rubrikTerbuka}
          onRubrikToggle={setRubrikTerbuka}
          onStatus={setStatus}
          skor={skor}
          onScore={setAnswerScore}
          onPrevious={() => setTaskIndex(index => Math.max(0, index - 1))}
          onNext={() => setTaskIndex(index => Math.min(visibleGroups.length - 1, index + 1))}
        />
      ) : groups.length > 0 && profile.hanya && profile.kelas.length > 0 ? (
        <div className="p-8 text-center text-mute bg-white rounded-card border border-bd">
          Tidak ada tugas untuk kelas yang dipilih. Ubah pilihan kelas atau matikan filter “Hanya tampilkan kelas saya”.
        </div>
      ) : (
        <div className="p-8 text-center text-mute bg-white rounded-card border border-bd">
          Belum ada tugas anotasi. Muat file template Feedback dari notebook.
        </div>
      )}
    </div>
  );
};

interface FeedbackTaskProps {
  group: FeedbackGroup;
  index: number;
  total: number;
  rubrik: RubrikRow[];
  rubrikTerbuka: boolean;
  onRubrikToggle: (open: boolean) => void;
  onStatus: (answer: FeedbackRow, status: 'Yes' | 'No') => void;
  skor: Record<string, SkorJawaban>;
  onScore: (answer: FeedbackRow, criteria: string, score: NilaiSkor) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const FeedbackTask: React.FC<FeedbackTaskProps> = ({
  group,
  index,
  total,
  rubrik,
  rubrikTerbuka,
  onRubrikToggle,
  onStatus,
  skor,
  onScore,
  onPrevious,
  onNext,
}) => {
  const orderedRows = stableFeedbackDisplayOrder(group);
  const complete = feedbackGroupComplete(group, skor, rubrik);
  const clearPreference = hasClearFeedbackPreference(group, skor, rubrik);
  const hasNextTask = index + 1 < total;
  return (
    <section className="p-5 rounded-card bg-white border border-bd shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <strong className="text-base font-bold text-tx">Tugas {index + 1} dari {total}</strong>
        <span className="badge-qb">Kelas {group.rows[0]?.kelas || '-'}</span>
      </div>
      <div className="h-2 rounded-full bg-bd/60 overflow-hidden mb-4" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
        <div className="h-full bg-pri rounded-full" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <h2 className="text-xl font-bold text-tx mb-3">{group.rows[0]?.pertanyaan || 'Pertanyaan tidak tersedia'}</h2>
      {group.rows[0]?.context && (
        <details className="mb-3">
          <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center">Materi referensi</summary>
          <p className="p-3 bg-bg/60 rounded-btn text-sm leading-relaxed">{group.rows[0].context}</p>
        </details>
      )}
      <details
        open={rubrikTerbuka}
        onToggle={event => onRubrikToggle(event.currentTarget.open)}
        className="mb-3"
      >
        <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center justify-between">
          Rubrik penilaian
          <ChevronDown className="w-4 h-4 text-mute" />
        </summary>
        <RubrikTable rubrik={rubrik} />
      </details>
      <p className="text-sm text-tx mb-4">
        Skala: 1 = kurang, 3 = cukup, 5 = baik. Pilih Yes jika jawaban layak diterima, No jika tidak.
        {ANOTASI_YES_NO_RULE.trim() && <span className="block mt-1">{ANOTASI_YES_NO_RULE}</span>}
      </p>
      {group.rows.length !== 2 && (
        <div role="status" className="mb-3 p-3 rounded-card bg-amber-50 text-amber-900 text-xs">
          Pasangan ini memiliki {group.rows.length} baris; format notebook mengharapkan tepat dua jawaban.
        </div>
      )}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))' }}>
        {orderedRows.map((row, rowIndex) => (
          <FeedbackAnswerCard
            key={`${feedbackRowKey(row)}-${rowIndex}`}
            row={row}
            label={`Jawaban ${rowIndex + 1}`}
            rubric={rubrik}
            score={skor[feedbackRowKey(row)] ?? {}}
            onStatus={onStatus}
            onScore={onScore}
          />
        ))}
      </div>
      {orderedRows.flatMap((row, rowIndex) =>
        getSkorConsistencyWarnings(row, `Jawaban ${rowIndex + 1}`, rubrik, skor[feedbackRowKey(row)] ?? {})
      ).map(message => (
        <div key={message} role="status" className="mt-3 p-3 rounded-card bg-amber-50 border border-amber-300 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 inline-block mr-1 align-text-bottom" />{message}
        </div>
      ))}
      {complete && !clearPreference && (
        <p role="status" className="mt-3 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Pasangan ini tidak menghasilkan preferensi yang jelas.
        </p>
      )}
      {complete && clearPreference && (
        <p className="mt-3 text-xs text-pri flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Kedua jawaban sudah dinilai.
        </p>
      )}
      <div className="flex justify-between mt-5">
        <button type="button" onClick={onPrevious} disabled={index === 0} className="px-4 py-2 min-h-[44px] rounded-btn border border-bdi disabled:opacity-40">Sebelumnya</button>
        <button type="button" onClick={onNext} disabled={!hasNextTask} className="px-4 py-2 min-h-[44px] rounded-btn border border-bdi disabled:opacity-40">Berikutnya</button>
      </div>
      {!hasNextTask && (
        <p role="status" className="mt-2 text-xs text-mute text-right">
          Ini tugas terakhir pada daftar yang ditampilkan. Gunakan “Simpan hasil saya (.xlsx)” untuk mengekspor anotasi.
        </p>
      )}
    </section>
  );
};

interface FeedbackAnswerCardProps {
  row: FeedbackRow;
  label: string;
  rubric: RubrikRow[];
  score: SkorJawaban;
  onStatus: (answer: FeedbackRow, status: 'Yes' | 'No') => void;
  onScore: (answer: FeedbackRow, criteria: string, score: NilaiSkor) => void;
}

const FeedbackAnswerCard: React.FC<FeedbackAnswerCardProps> = ({
  row,
  label,
  rubric,
  score,
  onStatus,
  onScore,
}) => (
  <article className="p-4 rounded-card border border-bd bg-bg/30">
    <h3 className="text-sm font-bold text-tx mb-2">{label}</h3>
    <p className="text-sm leading-relaxed text-tx whitespace-pre-wrap">{row.jawaban || 'Jawaban kosong'}</p>
    <div className="mt-3">
      {rubric.map(criteria => (
        <SkorKriteriaRow
          key={criteria.kriteria}
          criteria={criteria}
          score={score[criteria.kriteria]}
          answerLabel={label}
          onSelect={value => onScore(row, criteria.kriteria, value)}
        />
      ))}
    </div>
    <div className="flex gap-2 mt-3 pt-3 border-t border-bd">
      {(['Yes', 'No'] as const).map(status => {
        const selected = row.status === status;
        const color = status === 'Yes' ? 'bg-emerald-700 border-emerald-700' : 'bg-red-700 border-red-700';
        return (
          <button
            key={status}
            type="button"
            aria-pressed={selected}
            onClick={() => onStatus(row, status)}
            className={`min-h-[44px] flex-1 rounded-btn border font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${selected ? `${color} text-white` : 'bg-white text-tx border-bdi'}`}
          >
            {status}
          </button>
        );
      })}
    </div>
  </article>
);
