
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

import {
  ANOTASI_YES_NO_RULE,
  RUBRIK_DEFAULT,
  KRITERIA,
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

import {
  evaluatePair,
  toggleSkor,
} from '../lib/skor';

import {
  RubrikRow,
  SkorJawaban,
  NilaiSkor,
} from '../types';

// ==========================================
// LOCAL STORAGE
// ==========================================

const LS_ROWS = 'qb_guru_anotasi_rows_v1';
const LS_RUBRIK = 'qb_guru_anotasi_rubrik_v1';
const LS_SKOR = 'qb_guru_anotasi_skor_v1';
const LS_PROFILE = 'qb_guru_profil_v1';
const LS_EXPORT = 'qb_guru_anotasi_export_snapshot_v1';

// ==========================================
// INTERFACE
// ==========================================

interface GuruProfile {
  kode: string;
  kelas: number[];
  hanya: boolean;
}

// ==========================================
// LOAD DATA
// ==========================================

function loadStoredRows(): FeedbackRow[] {
  try {
    const saved = localStorage.getItem(LS_ROWS);

    return saved
      ? (JSON.parse(saved) as FeedbackRow[])
      : [];
  } catch (error) {
    console.error('Gagal memuat autosave anotasi:', error);
    return [];
  }
}

function loadStoredRubrik(): RubrikRow[] {
  try {
    const saved = localStorage.getItem(LS_RUBRIK);

    if (!saved) return RUBRIK_DEFAULT;

    const parsed = JSON.parse(saved) as RubrikRow[];

    const byName = new Map(
      parsed.map(item => [
        item.kriteria.trim(),
        item,
      ])
    );

    // Hanya gunakan empat kriteria aktif.
    return KRITERIA.map(
      name =>
        byName.get(name) ??
        RUBRIK_DEFAULT.find(
          item => item.kriteria === name
        )!
    );
  } catch (error) {
    console.error('Gagal memuat rubrik anotasi:', error);
    return RUBRIK_DEFAULT;
  }
}

function loadStoredSkor(): Record<string, SkorJawaban> {
  try {
    const saved = localStorage.getItem(LS_SKOR);

    return saved
      ? (JSON.parse(saved) as Record<string, SkorJawaban>)
      : {};
  } catch (error) {
    console.error('Gagal memuat skor anotasi:', error);
    return {};
  }
}

function loadStoredProfile(): GuruProfile {
  try {
    const saved = localStorage.getItem(LS_PROFILE);
    const parsed = saved ? JSON.parse(saved) : {};

    return {
      kode: String(parsed.kode ?? '').slice(0, 12),

      kelas: Array.isArray(parsed.kelas)
        ? parsed.kelas.filter(
            (kelas: number) =>
              Number.isInteger(kelas) &&
              kelas >= 1 &&
              kelas <= 6
          )
        : [],

      hanya: parsed.hanya !== false,
    };
  } catch (error) {
    console.error('Gagal memuat profil guru:', error);

    return {
      kode: '',
      kelas: [],
      hanya: true,
    };
  }
}

// ==========================================
// HALAMAN UTAMA ANOTASI GURU
// ==========================================

export const AnotasiGuruPage: React.FC<{
  warningMessages: string[];
}> = ({ warningMessages }) => {

  const [rows, setRows] = useState<FeedbackRow[]>(
    loadStoredRows
  );

  const [rubrik] = useState<RubrikRow[]>(
    loadStoredRubrik
  );

  const [skor, setSkor] = useState<
    Record<string, SkorJawaban>
  >(loadStoredSkor);

  const [profile, setProfile] = useState<GuruProfile>(
    loadStoredProfile
  );

  const [taskIndex, setTaskIndex] = useState(0);

  const [view, setView] = useState<
    'tasks' | 'review'
  >('tasks');

  const [rubrikTerbuka, setRubrikTerbuka] =
    useState(true);

  const [isExporting, setIsExporting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [success, setSuccess] = useState<string | null>(
    null
  );

  const [exportSnapshot, setExportSnapshot] =
    useState<string | null>(
      () => localStorage.getItem(LS_EXPORT)
    );

  // ==========================================
  // GROUPING DATA
  // ==========================================

  const groups = useMemo(
    () => groupFeedbackRows(rows),
    [rows]
  );

  const visibleGroups = useMemo(() => {
    if (
      !profile.hanya ||
      profile.kelas.length === 0
    ) {
      return groups;
    }

    return groups.filter(group =>
      profile.kelas.includes(
        extractKelasNum(
          group.rows[0]?.kelas
        ) ?? -1
      )
    );
  }, [
    groups,
    profile.hanya,
    profile.kelas,
  ]);

  const activeGroup = visibleGroups[taskIndex];

  const groupsWithId = groups.filter(
    group => group.id.trim() !== ''
  );

  // ==========================================
  // VALIDASI
  // ==========================================

  const completedCount = groupsWithId.filter(
    group =>
      feedbackGroupComplete(
        group,
        skor,
        rubrik
      ) &&
      hasClearFeedbackPreference(
        group,
        skor,
        rubrik
      )
  ).length;

  const kodeGuruValid =
    profile.kode.trim().length > 0;

  // REVIEW:
  // Hanya membutuhkan semua skor dan status lengkap.
  // Tidak membutuhkan Kode Guru.
  // Tidak membutuhkan preferensi Yes > No.
  const canReview =
    visibleGroups.length > 0 &&
    visibleGroups.every(group =>
      feedbackGroupComplete(
        group,
        skor,
        rubrik
      )
    );

  // DOWNLOAD:
  // Harus memenuhi seluruh validasi DPO.
  const allGroupsValid =
    visibleGroups.length > 0 &&
    visibleGroups.every(group =>
      feedbackGroupComplete(
        group,
        skor,
        rubrik
      ) &&
      hasClearFeedbackPreference(
        group,
        skor,
        rubrik
      )
    );

  const canDownload =
    !isExporting &&
    kodeGuruValid &&
    allGroupsValid;

  // ==========================================
  // AUTOSAVE
  // ==========================================

  useEffect(() => {
    if (rows.length) {
      localStorage.setItem(
        LS_ROWS,
        JSON.stringify(rows)
      );
    }
  }, [rows]);

  useEffect(() => {
    localStorage.setItem(
      LS_SKOR,
      JSON.stringify(skor)
    );
  }, [skor]);

  useEffect(() => {
    localStorage.setItem(
      LS_RUBRIK,
      JSON.stringify(rubrik)
    );
  }, [rubrik]);

  // ==========================================
  // INDEX VALIDATION
  // ==========================================

  useEffect(() => {
    setTaskIndex(index =>
      Math.min(
        index,
        Math.max(visibleGroups.length - 1, 0)
      )
    );
  }, [visibleGroups.length]);

  // ==========================================
  // BEFORE UNLOAD
  // ==========================================

  useEffect(() => {
    const beforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      const hasRatings =
        rows.some(
          row =>
            row.status === 'Yes' ||
            row.status === 'No'
        ) ||
        Object.keys(skor).length > 0;

      const snapshot = JSON.stringify({
        rows,
        skor,
        rubrik,
        kodeGuru: profile.kode,
      });

      if (
        hasRatings &&
        snapshot !== exportSnapshot
      ) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener(
      'beforeunload',
      beforeUnload
    );

    return () =>
      window.removeEventListener(
        'beforeunload',
        beforeUnload
      );
  }, [
    rows,
    skor,
    rubrik,
    profile.kode,
    exportSnapshot,
  ]);

  // ==========================================
  // PROGRESS BOARD
  // ==========================================

  const boardItems = [1, 2, 3, 4, 5, 6].map(
    kelas => {
      const classGroups = groupsWithId.filter(
        group =>
          extractKelasNum(
            group.rows[0]?.kelas
          ) === kelas
      );

      return {
        kelas,

        totalTugas: classGroups.length,

        tugasDinilai: classGroups.filter(
          group =>
            feedbackGroupComplete(
              group,
              skor,
              rubrik
            ) &&
            hasClearFeedbackPreference(
              group,
              skor,
              rubrik
            )
        ).length,

        isMyClass: profile.kelas.includes(kelas),
      };
    }
  );

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const updateProfile = (next: GuruProfile) => {
    setProfile(next);

    localStorage.setItem(
      LS_PROFILE,
      JSON.stringify(next)
    );
  };

  // ==========================================
  // YES / NO
  // ==========================================

  const setStatus = (
    answer: FeedbackRow,
    status: 'Yes' | 'No'
  ) => {
    const key = feedbackRowKey(answer);

    setRows(current =>
      current.map(row => {
        const rowKey = feedbackRowKey(row);
        if (rowKey === key) {
          return {
            ...row,
            status,
          };
        }
        return row;
      })
    );
  };

  // ==========================================
  // SCORE
  // ==========================================

  const setAnswerScore = (
    answer: FeedbackRow,
    criteria: string,
    value: NilaiSkor
  ) => {
    const key = feedbackRowKey(answer);

    setSkor(current => {
      const next = { ...current };

      const answerScores = toggleSkor(
        next[key] ?? {},
        criteria,
        value
      );

      if (
        Object.keys(answerScores).length
      ) {
        next[key] = answerScores;
      } else {
        delete next[key];
      }

      return next;
    });
  };

  // ==========================================
  // SAVE AND DOWNLOAD EXCEL
  // ==========================================

  const saveResults = async () => {
    setError(null);
    setSuccess(null);

    const kodeGuru = profile.kode.trim();

    if (!kodeGuru) {
      setError(
        'Kode Guru wajib diisi sebelum menyimpan hasil anotasi.'
      );
      return;
    }

    if (visibleGroups.length === 0) {
      setError(
        'Tidak ada data anotasi untuk diunduh.'
      );
      return;
    }

    const invalidGroups = visibleGroups.filter(
      group =>
        !feedbackGroupComplete(
          group,
          skor,
          rubrik
        ) ||
        !hasClearFeedbackPreference(
          group,
          skor,
          rubrik
        )
    );

    if (invalidGroups.length > 0) {
      setError(
        `Masih ada ${invalidGroups.length} pasangan yang belum valid. Pastikan semua skor terisi, tepat satu Yes dan satu No, serta skor Yes lebih tinggi daripada No.`
      );
      return;
    }

    setIsExporting(true);

    try {
      const reviewRows = visibleGroups.flatMap(
        group => group.rows
      );

      await eksporFeedbackGuru(
        reviewRows,
        kodeGuru,
        rubrik,
        skor
      );

      const snapshot = JSON.stringify({
        rows,
        skor,
        rubrik,
        kodeGuru,
      });

      localStorage.setItem(
        LS_EXPORT,
        snapshot
      );

      setExportSnapshot(snapshot);

      setSuccess(
        `Berhasil! File feedback_guru_${kodeGuru.replace(/[^\w-]/g, '_')}.xlsx telah diunduh.`
      );

    } catch (caught) {
      console.error(
        'Gagal mengekspor Excel:',
        caught
      );

      const reason =
        caught instanceof Error
          ? caught.message
          : 'Terjadi kesalahan saat membuat file.';

      setError(
        `Gagal menyimpan hasil anotasi: ${reason}`
      );

    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

      {/* =====================================
          PROFIL GURU DAN PROGRES
      ====================================== */}

      <section className="p-5 rounded-card bg-white border border-bd shadow-sm">

        <div className="flex flex-wrap items-end justify-between gap-4">

          {/* KODE GURU */}

          <label className="min-w-[200px]">

            <span className="block text-xs font-bold uppercase tracking-wider text-mute mb-1.5">
              Kode Guru (Wajib)
            </span>

            <input
              value={profile.kode}
              maxLength={12}
              required
              onChange={event =>
                updateProfile({
                  ...profile,
                  kode: event.target.value.slice(0, 12),
                })
              }
              placeholder="Contoh: G01"
              className="w-full px-3 py-2 min-h-[44px] rounded-btn border border-bdi text-sm"
            />

            <span className="text-xs text-mute">
              Wajib diisi sebelum menyimpan hasil anotasi.
            </span>

          </label>

          {/* KELAS GURU */}

          <div className="flex-1 min-w-[280px]">

            <span className="block text-xs font-bold uppercase tracking-wider text-mute mb-1.5">
              Kelas yang Saya Kuasai / Ditugaskan
            </span>

            <div className="flex flex-wrap gap-1.5">

              {[1, 2, 3, 4, 5, 6].map(kelas => {
                const selected =
                  profile.kelas.includes(kelas);

                return (
                  <button
                    key={kelas}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      updateProfile({
                        ...profile,

                        kelas: selected
                          ? profile.kelas.filter(
                              value => value !== kelas
                            )
                          : [
                              ...profile.kelas,
                              kelas,
                            ].sort(),
                      })
                    }
                    className={`min-h-[44px] px-3.5 py-1.5 rounded-btn text-xs font-bold border ${
                      selected
                        ? 'bg-tint text-pri border-2 border-pri'
                        : 'bg-white text-tx border-bdi'
                    }`}
                  >
                    Kelas {kelas}
                  </button>
                );
              })}

            </div>

          </div>

          {/* FILTER KELAS */}

          <button
            type="button"
            aria-pressed={profile.hanya}
            onClick={() =>
              updateProfile({
                ...profile,
                hanya: !profile.hanya,
              })
            }
            className="min-h-[44px] px-4 py-2 rounded-btn text-xs font-bold border bg-white text-tx border-bdi"
          >
            Hanya tampilkan kelas saya
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <p
            role="alert"
            className="mt-3 text-xs font-semibold text-danger"
          >
            {error}
          </p>
        )}

        {/* SUCCESS */}

        {success && (
          <p
            role="status"
            className="mt-3 text-xs font-semibold text-pri"
          >
            {success}
          </p>
        )}

        {/* WARNING */}

        {warningMessages.length > 0 && (
          <div
            role="status"
            className="mt-3 p-3 rounded-card bg-amber-50 border border-amber-300 text-amber-900 text-xs"
          >

            <strong>
              Periksa pasangan ID berikut (peringatan tidak menghalangi anotasi):
            </strong>

            <ul className="list-disc pl-5 mt-1">
              {warningMessages.map(message => (
                <li key={message}>
                  {message}
                </li>
              ))}
            </ul>

          </div>
        )}

        {/* PROGRESS */}

        <div className="mt-4">

          <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">
            Progres Per Kelas (
            {completedCount} / {groupsWithId.length} tugas dinilai)
          </div>

          <ProgressBoard items={boardItems} />

        </div>

      </section>

      {/* =====================================
          HALAMAN ANOTASI
      ====================================== */}

      {view === 'tasks' && activeGroup ? (

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

          onPrevious={() =>
            setTaskIndex(index =>
              Math.max(0, index - 1)
            )
          }

          onNext={() => {
            if (
              taskIndex + 1 < visibleGroups.length
            ) {
              setTaskIndex(index =>
                Math.min(
                  visibleGroups.length - 1,
                  index + 1
                )
              );
            } else {
              setView('review');
            }
          }}

          onReview={() => {
            setError(null);
            setSuccess(null);
            setView('review');
          }}

          canReview={canReview}
        />

      ) : view === 'review' ? (

        /* =====================================
           HALAMAN REVIEW
        ====================================== */

        <section className="p-5 rounded-card bg-white border border-bd shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

            <div>

              <h2 className="text-xl font-bold text-tx">
                Review Semua Jawaban
              </h2>

              <p className="text-sm text-mute mt-1">
                Periksa seluruh pasangan sebelum menyimpan dan mengunduh hasil DPO.
              </p>

            </div>

            <span className="badge-qb">
              {
                visibleGroups.filter(
                  group =>
                    feedbackGroupComplete(
                      group,
                      skor,
                      rubrik
                    ) &&
                    hasClearFeedbackPreference(
                      group,
                      skor,
                      rubrik
                    )
                ).length
              } / {visibleGroups.length} valid
            </span>

          </div>

          {/* PERINGATAN KODE GURU */}

          {!kodeGuruValid && (
            <div
              role="status"
              className="mb-4 p-3 rounded-card bg-amber-50 border border-amber-300 text-amber-900 text-sm"
            >
              Kode Guru wajib diisi sebelum mengunduh Excel. Kamu tetap bisa melakukan review dan memperbaiki jawaban.
            </div>
          )}

          {/* DAFTAR PASANGAN */}

          <div className="space-y-4">

            {visibleGroups.map((group, groupIndex) => {

              const complete =
                feedbackGroupComplete(
                  group,
                  skor,
                  rubrik
                );

              const clearPreference =
                hasClearFeedbackPreference(
                  group,
                  skor,
                  rubrik
                );

              const valid =
                complete && clearPreference;

              const ordered =
                stableFeedbackDisplayOrder(group);

              return (
                <article
                  key={group.id}
                  className="p-4 rounded-card border border-bd"
                >

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <div>

                      <p className="text-xs font-bold text-mute">
                        TUGAS {groupIndex + 1} · ID {group.id}
                      </p>

                      <h3 className="font-bold text-tx mt-1">
                        {group.rows[0]?.pertanyaan}
                      </h3>

                    </div>

                    <span
                      className={`text-xs font-bold ${
                        valid
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {valid
                        ? 'Valid · Preferensi jelas'
                        : !complete
                          ? 'Belum lengkap'
                          : 'Preferensi belum valid'}
                    </span>

                  </div>

                  {/* JAWABAN */}

                  <div className="grid gap-3 mt-3 md:grid-cols-2">

                    {ordered.map((row, index) => (

                      <div
                        key={feedbackRowKey(row)}
                        className="p-3 rounded-btn bg-bg/50"
                      >

                        <p className="text-xs font-bold text-mute mb-1">
                          Jawaban {index + 1}
                        </p>

                        <p className="text-sm whitespace-pre-wrap">
                          {row.jawaban}
                        </p>

                        <span
                          className={`inline-block mt-2 text-xs font-bold ${
                            row.status === 'Yes'
                              ? 'text-emerald-700'
                              : row.status === 'No'
                                ? 'text-red-700'
                                : 'text-mute'
                          }`}
                        >
                          {row.status || 'Belum dipilih'}
                        </span>

                      </div>

                    ))}

                  </div>

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() => {
                      setTaskIndex(groupIndex);
                      setView('tasks');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="mt-3 px-3 py-2 min-h-[40px] rounded-btn border border-bdi text-sm font-semibold"
                  >
                    Perbaiki jawaban
                  </button>

                </article>
              );
            })}

          </div>

          {/* ERROR */}

          {error && (
            <p
              role="alert"
              className="mt-3 text-xs font-semibold text-danger"
            >
              {error}
            </p>
          )}

          {/* SUCCESS */}

          {success && (
            <p
              role="status"
              className="mt-3 text-xs font-semibold text-pri"
            >
              {success}
            </p>
          )}

          {/* =====================================
              TOMBOL REVIEW DAN DOWNLOAD
          ====================================== */}

          <div className="flex flex-wrap justify-between gap-2 mt-5">

            <button
              type="button"
              onClick={() => {
                setView('tasks');

                setTaskIndex(
                  Math.max(
                    visibleGroups.length - 1,
                    0
                  )
                );

                setError(null);
                setSuccess(null);
              }}
              className="px-4 py-2 min-h-[44px] rounded-btn border border-bdi"
            >
              Kembali ke anotasi
            </button>

            <button
              type="button"
              disabled={!canDownload}
              onClick={saveResults}
              className="px-4 py-2 min-h-[44px] rounded-btn border border-pri bg-pri text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExporting
                ? 'Mengunduh & mengunggah...'
                : 'Simpan & Download Excel'}
            </button>

          </div>

        </section>

      ) : groups.length > 0 &&
        profile.hanya &&
        profile.kelas.length > 0 ? (

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

// ==========================================
// KOMPONEN TUGAS ANOTASI
// ==========================================

interface FeedbackTaskProps {
  group: FeedbackGroup;
  index: number;
  total: number;
  rubrik: RubrikRow[];
  rubrikTerbuka: boolean;
  onRubrikToggle: (open: boolean) => void;

  onStatus: (
    answer: FeedbackRow,
    status: 'Yes' | 'No'
  ) => void;

  skor: Record<string, SkorJawaban>;

  onScore: (
    answer: FeedbackRow,
    criteria: string,
    score: NilaiSkor
  ) => void;

  onPrevious: () => void;
  onNext: () => void;
  onReview: () => void;
  canReview: boolean;
}

// ==========================================
// FEEDBACK TASK
// ==========================================

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
  onReview,
  canReview,
}) => {

  const orderedRows =
    stableFeedbackDisplayOrder(group);

  const complete =
    feedbackGroupComplete(
      group,
      skor,
      rubrik
    );

  const clearPreference =
    hasClearFeedbackPreference(
      group,
      skor,
      rubrik
    );

  const hasNextTask =
    index + 1 < total;

  return (
    <section className="p-5 rounded-card bg-white border border-bd shadow-sm">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

        <strong className="text-base font-bold text-tx">
          Tugas {index + 1} dari {total}
        </strong>

        <span className="badge-qb">
          Kelas {group.rows[0]?.kelas || '-'}
        </span>

      </div>

      {/* PROGRESS BAR */}

      <div
        className="h-2 rounded-full bg-bd/60 overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-pri rounded-full"
          style={{
            width: `${((index + 1) / total) * 100}%`,
          }}
        />
      </div>

      {/* PERTANYAAN */}

      <h2 className="text-xl font-bold text-tx mb-3">
        {group.rows[0]?.pertanyaan ||
          'Pertanyaan tidak tersedia'}
      </h2>

      {/* CONTEXT */}

      {group.rows[0]?.context && (
        <details className="mb-3">

          <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center">
            Materi referensi
          </summary>

          <p className="p-3 bg-bg/60 rounded-btn text-sm leading-relaxed">
            {group.rows[0].context}
          </p>

        </details>
      )}

      {/* RUBRIK */}

      <details
        open={rubrikTerbuka}
        onToggle={event =>
          onRubrikToggle(
            event.currentTarget.open
          )
        }
        className="mb-3"
      >

        <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center justify-between">
          Rubrik penilaian
          <ChevronDown className="w-4 h-4 text-mute" />
        </summary>

        <RubrikTable rubrik={rubrik} />

      </details>

      {/* PETUNJUK */}

      <p className="text-sm text-tx mb-4">

        Skala: 1 = kurang, 3 = cukup, 5 = baik.
        Wajib pilih satu skor (1–5) untuk setiap
        kriteria pada kedua jawaban. Tidak boleh ada
        kriteria yang dilewati. Pilih Yes jika jawaban
        layak diterima, No jika tidak.

        {ANOTASI_YES_NO_RULE.trim() && (
          <span className="block mt-1">
            {ANOTASI_YES_NO_RULE}
          </span>
        )}

      </p>

      {/* JUMLAH KANDIDAT */}

      {group.rows.length !== 2 && (
        <div
          role="status"
          className="mb-3 p-3 rounded-card bg-amber-50 text-amber-900 text-xs"
        >
          Pasangan ini memiliki {group.rows.length} baris;
          format notebook mengharapkan tepat dua jawaban.
        </div>
      )}

      {/* KARTU JAWABAN */}

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        }}
      >

        {orderedRows.map((row, rowIndex) => (

          <FeedbackAnswerCard
            key={`${feedbackRowKey(row)}-${rowIndex}`}
            row={row}
            label={`Jawaban ${rowIndex + 1}`}
            rubric={rubrik}
            score={
              skor[feedbackRowKey(row)] ?? {}
            }
            onStatus={onStatus}
            onScore={onScore}
          />

        ))}

      </div>

      {/* VALIDASI PASANGAN BERBASIS SKOR */}

      {(() => {
        const evaluation = evaluatePair(group.rows, skor, rubrik);
        if (!evaluation.warning) return null;
        return (
          <p
            role="status"
            className="mt-3 text-xs text-amber-800 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            {evaluation.warning}
          </p>
        );
      })()}

      {/* SUCCESS */}

      {complete && clearPreference && (
        <p className="mt-3 text-xs text-pri flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />

          Kedua jawaban sudah dinilai dan preferensi valid.
        </p>
      )}

      {/* NAVIGATION */}

      <div className="flex justify-between mt-5">

        <button
          type="button"
          onClick={onPrevious}
          disabled={index === 0}
          className="px-4 py-2 min-h-[44px] rounded-btn border border-bdi disabled:opacity-40"
        >
          Sebelumnya
        </button>

        {hasNextTask ? (

          <button
            type="button"
            onClick={onNext}
            disabled={!complete || !clearPreference}
            className="px-4 py-2 min-h-[44px] rounded-btn border border-bdi disabled:opacity-40"
          >
            Berikutnya
          </button>

        ) : (

          <button
            type="button"
            onClick={onReview}
            disabled={!canReview}
            className="px-4 py-2 min-h-[44px] rounded-btn border border-pri bg-pri text-white disabled:opacity-40"
          >
            Review Semua Jawaban
          </button>

        )}

      </div>

      {!hasNextTask && (
        <p className="mt-3 text-xs text-mute">
          Ini tugas terakhir pada daftar yang ditampilkan.
        </p>
      )}

      {/* INCOMPLETE MESSAGE */}

      {!evaluatePair(group.rows, skor, rubrik).isComplete && (
        <p
          role="status"
          className="mt-2 text-xs text-red-700 text-right"
        >
          Lengkapi seluruh skor pada kedua jawaban.
          Pilih tepat satu Yes dan satu No.
        </p>
      )}

    </section>
  );
};

// ==========================================
// KOMPONEN KARTU JAWABAN
// ==========================================

interface FeedbackAnswerCardProps {
  row: FeedbackRow;
  label: string;
  rubric: RubrikRow[];
  score: SkorJawaban;

  onStatus: (
    answer: FeedbackRow,
    status: 'Yes' | 'No'
  ) => void;

  onScore: (
    answer: FeedbackRow,
    criteria: string,
    score: NilaiSkor
  ) => void;
}

// ==========================================
// FEEDBACK ANSWER CARD
// ==========================================

const FeedbackAnswerCard: React.FC<
  FeedbackAnswerCardProps
> = ({
  row,
  label,
  rubric,
  score,
  onStatus,
  onScore,
}) => (

  <article className="p-4 rounded-card border border-bd bg-bg/30">

    <h3 className="text-sm font-bold text-tx mb-2">
      {label}
    </h3>

    {/* JAWABAN */}

    <p className="text-sm leading-relaxed text-tx whitespace-pre-wrap">
      {row.jawaban || 'Jawaban kosong'}
    </p>

    {/* RUBRIK SKOR */}

    <div className="mt-3">

      {rubric.map(criteria => (

        <SkorKriteriaRow
          key={criteria.kriteria}
          criteria={criteria}
          score={score[criteria.kriteria]}
          answerLabel={label}
          onSelect={value =>
            onScore(
              row,
              criteria.kriteria,
              value
            )
          }
        />

      ))}

    </div>

    {/* YES / NO */}

    <div className="flex gap-2 mt-3 pt-3 border-t border-bd">

      {(['Yes', 'No'] as const).map(status => {

        const selected =
          row.status === status;

        const color =
          status === 'Yes'
            ? 'bg-emerald-700 border-emerald-700'
            : 'bg-red-700 border-red-700';

        return (

          <button
            key={status}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onStatus(row, status)
            }
            className={`min-h-[44px] flex-1 rounded-btn border font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              selected
                ? `${color} text-white`
                : 'bg-white text-tx border-bdi'
            }`}
          >
            {status}
          </button>

        );
      })}

    </div>

  </article>
);
