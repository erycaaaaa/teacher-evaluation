import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Download, Layers, Loader2 } from 'lucide-react';
import {
  AuditTrailEntry,
  EvaluasiGuruRow,
  GuruProfil,
  HasilPenilaianTugas,
  PaketTugas,
  PenilaianTugasMentah,
  Tugas,
} from '../types';
import { KRITERIA, RUBRIK_DEFAULT } from '../lib/constants';
import { deriveDecision, deriveScores, getPlacement } from '../lib/blind';
import { extractKelasNum } from '../lib/kelas';
import { eksporHasilGuru } from '../lib/exportXlsx';
import { ScoreRow } from '../components/ScoreRow';
import { RubrikTable } from '../components/RubrikTable';
import { ProgressBoard } from '../components/ProgressBoard';

const LS_PROFILE = 'qb_guru_profil_v1';
const LS_EVALUATION_DATA = 'qb_guru_eval_data_v1';
const LS_EVALUATION_EXPORT = 'qb_guru_eval_export_snapshot_v1';

interface EvaluationStorage {
  hasil: Record<string, HasilPenilaianTugas>;
  audit: AuditTrailEntry[];
  draf: Record<string, PenilaianTugasMentah>;
}

function readEvaluationData(): EvaluationStorage {
  try {
    const raw = localStorage.getItem(LS_EVALUATION_DATA);
    return raw ? JSON.parse(raw) as EvaluationStorage : { hasil: {}, audit: [], draf: {} };
  } catch (error) {
    console.error('Gagal memulihkan penilaian evaluasi:', error);
    return { hasil: {}, audit: [], draf: {} };
  }
}

function readProfile(): GuruProfil {
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    const saved = raw ? JSON.parse(raw) : {};
    return {
      kode: String(saved.kode ?? '').slice(0, 12),
      kelas: Array.isArray(saved.kelas)
        ? saved.kelas.filter((kelas: number) => Number.isInteger(kelas) && kelas >= 1 && kelas <= 6)
        : [],
      hanya: saved.hanya !== false,
    };
  } catch (error) {
    console.error('Gagal memulihkan profil guru:', error);
    return { kode: '', kelas: [], hanya: true };
  }
}

const emptyDraft = (): PenilaianTugasMentah => ({
  skorA: {},
  skorB: {},
  keputusan: null,
  komentar: '',
  kotor: false,
});

export const EvaluasiGuruPage: React.FC<{ paket: PaketTugas }> = ({ paket }) => {
  const initial = useMemo(readEvaluationData, []);
  const [profile, setProfile] = useState<GuruProfil>(readProfile);
  const [results, setResults] = useState(initial.hasil);
  const [audit, setAudit] = useState(initial.audit);
  const [drafts, setDrafts] = useState(initial.draf);
  const [taskIndex, setTaskIndex] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [exportSnapshot, setExportSnapshot] = useState<string | null>(() =>
    localStorage.getItem(LS_EVALUATION_EXPORT)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_EVALUATION_DATA, JSON.stringify({ hasil: results, audit, draf: drafts }));
  }, [results, audit, drafts]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      const dirtyDraft = Object.values(drafts).some(draft => draft.kotor);
      const resultsNotExported = Object.keys(results).length > 0 &&
        JSON.stringify(results) !== exportSnapshot;
      if (dirtyDraft || resultsNotExported) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [drafts, results, exportSnapshot]);

  const visibleTasks = useMemo(() => {
    if (!profile.hanya || profile.kelas.length === 0) return paket.tugas;
    return paket.tugas.filter(task => profile.kelas.includes(extractKelasNum(task.kelas) ?? -1));
  }, [paket.tugas, profile.hanya, profile.kelas]);
  const activeTask = visibleTasks[taskIndex];
  const classFilterEmpty = profile.hanya && profile.kelas.length > 0 && visibleTasks.length === 0;

  const boardItems = [1, 2, 3, 4, 5, 6].map(kelas => {
    const tasks = paket.tugas.filter(task => extractKelasNum(task.kelas) === kelas);
    return {
      kelas,
      totalTugas: tasks.length,
      tugasDinilai: tasks.filter(task => results[task.id]).length,
      isMyClass: profile.kelas.includes(kelas),
    };
  });

  const draft = activeTask
    ? drafts[activeTask.id] ?? (results[activeTask.id] ? {
        ...results[activeTask.id].mentah,
        komentar: results[activeTask.id].komentar,
        kotor: false,
      } : emptyDraft())
    : emptyDraft();
  const placement = activeTask ? getPlacement(activeTask.id) : { A: 'sft' as const, B: 'dpo' as const };
  const complete = Boolean(
    activeTask &&
    KRITERIA.every((_, index) => draft.skorA[index] !== undefined) &&
    (activeTask.identik || KRITERIA.every((_, index) => draft.skorB[index] !== undefined)) &&
    (activeTask.identik || draft.keputusan !== null) &&
    draft.komentar.trim()
  );
  const totalRated = Object.keys(results).length;

  const updateProfile = (next: GuruProfil) => {
    setProfile(next);
    localStorage.setItem(LS_PROFILE, JSON.stringify(next));
  };

  const updateDraft = (updater: (previous: PenilaianTugasMentah) => PenilaianTugasMentah) => {
    if (!activeTask) return;
    setDrafts(current => ({
      ...current,
      [activeTask.id]: { ...updater(draft), kotor: true },
    }));
  };

  const saveTask = (): boolean => {
    setSubmitAttempted(true);
    if (!activeTask || !complete) return false;
    const previous = results[activeTask.id];
    if (previous) {
      setAudit(current => [...current, {
        id: previous.id,
        keputusan: previous.keputusan,
        komentar: previous.komentar,
        skorSFT: previous.skorSFT,
        skorDPO: previous.skorDPO,
        waktu: previous.waktu,
        diarsipkan: new Date().toISOString(),
      }]);
    }
    const scores = deriveScores(
      draft.skorA,
      activeTask.identik ? draft.skorA : draft.skorB,
      activeTask.id,
      KRITERIA.length,
      activeTask.identik
    );
    const result: HasilPenilaianTugas = {
      id: activeTask.id,
      skorSFT: scores.skorSFT,
      skorDPO: scores.skorDPO,
      keputusan: deriveDecision(draft.keputusan ?? 'seri', activeTask.id, activeTask.identik),
      komentar: draft.komentar.trim(),
      waktu: new Date().toISOString(),
      identik: activeTask.identik,
      penempatanA: placement.A.toUpperCase() as 'SFT' | 'DPO',
      penempatanB: placement.B.toUpperCase() as 'SFT' | 'DPO',
      mentah: {
        ...draft,
        skorB: activeTask.identik ? { ...draft.skorA } : { ...draft.skorB },
        keputusan: activeTask.identik ? 'seri' : draft.keputusan,
        kotor: false,
      },
    };
    setResults(current => ({ ...current, [activeTask.id]: result }));
    setDrafts(current => ({ ...current, [activeTask.id]: { ...draft, kotor: false } }));
    setSubmitAttempted(false);
    return true;
  };

  const exportResults = async () => {
    setError(null);
    setSuccess(null);
    if (!profile.kode.trim()) {
      setError('Isi kode guru terlebih dahulu agar hasil dapat dikenali.');
      return;
    }
    const ratedTasks = paket.tugas.filter(task => results[task.id]);
    if (!ratedTasks.length) {
      setError('Belum ada tugas evaluasi yang selesai dinilai.');
      return;
    }
    setIsExporting(true);
    try {
      const rows: EvaluasiGuruRow[] = ratedTasks.map(task => {
        const result = results[task.id];
        return {
          ID: task.id,
          'Kode Guru': profile.kode.trim(),
          'Kelas Dikuasai Guru': profile.kelas.length ? profile.kelas.join(',') : '-',
          Kelas: task.kelas,
          Pertanyaan: task.pertanyaan,
          'Jawaban Acuan': task.acuan,
          'Varian Context': task.varian,
          'Jawaban SFT': task.sft,
          'Jawaban DPO': task.dpo,
          'Penempatan A': result.penempatanA,
          'Penempatan B': result.penempatanB,
          'SFT - Ketepatan Materi': result.skorSFT[0] ?? '',
          'SFT - Relevansi': result.skorSFT[1] ?? '',
          'SFT - Kejelasan Bahasa': result.skorSFT[2] ?? '',
          'SFT - Kesesuaian Usia': result.skorSFT[3] ?? '',
          'SFT - Keamanan': result.skorSFT[4] ?? '',
          'DPO - Ketepatan Materi': result.skorDPO[0] ?? '',
          'DPO - Relevansi': result.skorDPO[1] ?? '',
          'DPO - Kejelasan Bahasa': result.skorDPO[2] ?? '',
          'DPO - Kesesuaian Usia': result.skorDPO[3] ?? '',
          'DPO - Keamanan': result.skorDPO[4] ?? '',
          Keputusan: result.keputusan,
          Komentar: result.komentar,
          Waktu: result.waktu,
          Identik: task.identik ? 'ya' : 'tidak',
          Set: paket.set === 'validasi' ? 'validasi' : 'final_test',
          Siklus: paket.siklus ?? 1,
        };
      });
      await eksporHasilGuru(rows, audit, profile.kode);
      const snapshot = JSON.stringify(results);
      localStorage.setItem(LS_EVALUATION_EXPORT, snapshot);
      setExportSnapshot(snapshot);
      setSuccess(`Hasil evaluasi tersimpan (${rows.length} tugas).`);
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : 'Terjadi kesalahan saat membuat file.';
      setError(`Gagal membuat file Excel: ${reason}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="p-5 rounded-card bg-white border border-bd shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="min-w-[200px]">
            <span className="block text-xs font-bold uppercase tracking-wider text-mute mb-1.5">Kode Guru (Anonim)</span>
            <input value={profile.kode} maxLength={12} onChange={event => updateProfile({ ...profile, kode: event.target.value.slice(0, 12) })} placeholder="Contoh: G01" className="w-full px-3 py-2 min-h-[44px] rounded-btn border border-bdi text-sm" />
          </label>
          <div className="flex-1 min-w-[280px]">
            <span className="block text-xs font-bold uppercase tracking-wider text-mute mb-1.5">Kelas yang Saya Kuasai / Ditugaskan</span>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6].map(kelas => {
                const selected = profile.kelas.includes(kelas);
                return <button key={kelas} type="button" aria-pressed={selected} onClick={() => updateProfile({
                  ...profile,
                  kelas: selected ? profile.kelas.filter(value => value !== kelas) : [...profile.kelas, kelas].sort(),
                })} className={`min-h-[44px] px-3.5 py-1.5 rounded-btn text-xs font-bold border ${selected ? 'bg-tint text-pri border-2 border-pri' : 'bg-white text-tx border-bdi'}`}>Kelas {kelas}</button>;
              })}
            </div>
          </div>
          <button type="button" aria-pressed={profile.hanya} onClick={() => updateProfile({ ...profile, hanya: !profile.hanya })} className="min-h-[44px] px-4 py-2 rounded-btn text-xs font-bold border border-bdi">Hanya tampilkan kelas saya</button>
          <button type="button" disabled={isExporting} onClick={exportResults} className="min-h-[44px] px-4 py-2 rounded-btn bg-pri text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Simpan hasil saya (.xlsx)
          </button>
        </div>
        <p className="text-xs text-mute mt-3">
          Skor lima kriteria, keputusan A/B (kecuali jawaban identik), dan komentar wajib diisi.
          {classFilterEmpty && <span className="block mt-1 text-amber-800">Tidak ada tugas pada kelas pilihan. Ubah pilihan kelas atau matikan filter untuk melihat tugas.</span>}
        </p>
        {error && <p role="alert" className="mt-3 text-xs font-semibold text-danger">{error}</p>}
        {success && <p role="status" className="mt-3 text-xs font-semibold text-pri">{success}</p>}
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">Progres Per Kelas ({totalRated} / {paket.tugas.length} tugas dinilai)</div>
          <ProgressBoard items={boardItems} />
        </div>
      </section>

      {activeTask ? (
        <EvaluationTask
          task={activeTask}
          index={taskIndex}
          total={visibleTasks.length}
          placement={placement}
          draft={draft}
          submitAttempted={submitAttempted}
          complete={complete}
          updateDraft={updateDraft}
          onSave={() => {
            if (saveTask() && taskIndex < visibleTasks.length - 1) setTaskIndex(index => index + 1);
          }}
          onPrevious={() => setTaskIndex(index => Math.max(0, index - 1))}
          onNext={() => setTaskIndex(index => Math.min(visibleTasks.length - 1, index + 1))}
        />
      ) : classFilterEmpty ? (
        <div className="p-8 text-center text-mute bg-white rounded-card border border-bd">Tidak ada tugas untuk kelas pilihan. Ubah pilihan kelas atau matikan filter “Hanya tampilkan kelas saya”.</div>
      ) : (
        <div className="p-8 text-center text-mute bg-white rounded-card border border-bd">Paket evaluasi ini tidak memiliki tugas.</div>
      )}
    </div>
  );
};

interface EvaluationTaskProps {
  task: Tugas;
  index: number;
  total: number;
  placement: { A: 'sft' | 'dpo'; B: 'sft' | 'dpo' };
  draft: PenilaianTugasMentah;
  submitAttempted: boolean;
  complete: boolean;
  updateDraft: (updater: (previous: PenilaianTugasMentah) => PenilaianTugasMentah) => void;
  onSave: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const EvaluationTask: React.FC<EvaluationTaskProps> = ({
  task, index, total, placement, draft, submitAttempted, complete, updateDraft, onSave, onPrevious, onNext,
}) => (
  <section className="p-5 rounded-card bg-white border border-bd shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <strong className="text-base font-bold text-tx">Tugas {index + 1} dari {total}</strong>
      <div className="flex gap-1.5"><span className="badge-qb biru">Evaluasi</span><span className="badge-qb">Kelas {task.kelas}</span>{task.identik && <span className="badge-qb kuning">Jawaban identik</span>}</div>
    </div>
    <div className="h-2 rounded-full bg-bd/60 overflow-hidden mb-4" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
      <div className="h-full bg-pri rounded-full" style={{ width: `${((index + 1) / total) * 100}%` }} />
    </div>
    <h2 className="text-xl font-bold text-tx mb-3">{task.pertanyaan}</h2>
    <p className="text-xs text-mute italic mb-3">Identitas model disembunyikan selama penilaian.</p>
    <div className="divide-y divide-bd border-t border-bd">
      <details open className="py-2.5">
        <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center">Jawaban acuan (dari dataset)</summary>
        <p className="p-3 bg-bg/60 rounded-btn text-sm leading-relaxed">{task.acuan}</p>
      </details>
      <details className="py-2.5">
        <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center justify-between">Materi referensi <ChevronDown className="w-4 h-4" /></summary>
        <p className="p-3 bg-bg/60 rounded-btn text-sm leading-relaxed">{task.context || 'Materi referensi tidak tersedia.'}</p>
      </details>
      <details className="py-2.5">
        <summary className="font-semibold text-sm text-tx cursor-pointer min-h-[44px] flex items-center justify-between">Rubrik penilaian (skor 1–5) <ChevronDown className="w-4 h-4" /></summary>
        <RubrikTable rubrik={RUBRIK_DEFAULT} />
      </details>
    </div>

    {task.identik ? (
      <article className="mt-4 p-4 rounded-card border border-bd bg-bg/30">
        <div className="flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-pri" /><strong className="text-xs text-pri">Jawaban identik</strong></div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{task.sft}</p>
        {KRITERIA.map((name, criterion) => <ScoreRow key={name} kriteriaIndex={criterion} kriteriaName={name} isOptional={false} score={draft.skorA[criterion]} onSelectScore={score => updateDraft(previous => ({ ...previous, skorA: { ...previous.skorA, [criterion]: score }, skorB: { ...previous.skorA, [criterion]: score } }))} targetLabel="Jawaban" hasError={submitAttempted} />)}
      </article>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {(['A', 'B'] as const).map(label => {
            const slot = label === 'A' ? 'skorA' : 'skorB';
            const answer = placement[label] === 'sft' ? task.sft : task.dpo;
            return <article key={label} className="p-4 rounded-card border border-bd bg-bg/30">
              <strong className="text-xs text-mute">Jawaban {label}</strong>
              <p className="my-3 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
              {KRITERIA.map((name, criterion) => <ScoreRow key={name} kriteriaIndex={criterion} kriteriaName={name} isOptional={false} score={draft[slot][criterion]} onSelectScore={score => updateDraft(previous => ({ ...previous, [slot]: { ...previous[slot], [criterion]: score } }))} targetLabel={`Jawaban ${label}`} hasError={submitAttempted} />)}
            </article>;
          })}
        </div>
        <fieldset className="mt-4 p-4 rounded-card border border-bd">
          <legend className="text-sm font-bold">Keputusan keseluruhan</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {[
              ['a', 'Jawaban A lebih baik'],
              ['b', 'Jawaban B lebih baik'],
              ['seri', 'Keduanya sama baik'],
              ['tolak', 'Keduanya tidak dapat diterima'],
            ].map(([value, label]) => <button key={value} type="button" aria-pressed={draft.keputusan === value} onClick={() => updateDraft(previous => ({ ...previous, keputusan: value as PenilaianTugasMentah['keputusan'] }))} className={`min-h-[44px] rounded-btn border font-semibold text-sm ${draft.keputusan === value ? 'bg-tint text-pri border-pri' : 'bg-white border-bdi'}`}>{label}</button>)}
          </div>
          {submitAttempted && !draft.keputusan && <p className="text-xs text-danger mt-2">Keputusan wajib dipilih.</p>}
        </fieldset>
      </>
    )}
    <label className="block mt-4 text-xs font-bold uppercase tracking-wider text-mute">
      Komentar (Wajib)
      <textarea rows={3} value={draft.komentar} onChange={event => updateDraft(previous => ({ ...previous, komentar: event.target.value }))} className="w-full mt-1.5 px-3 py-2.5 rounded-btn border border-bdi text-sm font-normal normal-case" placeholder="Tulis alasan penilaian..." />
    </label>
    {submitAttempted && !draft.komentar.trim() && <p className="text-xs text-danger mt-1">Komentar wajib diisi.</p>}
    <div className="flex items-center justify-between mt-5">
      <button type="button" onClick={onPrevious} disabled={index === 0} className="min-h-[44px] px-4 rounded-btn border border-bdi disabled:opacity-40">Sebelumnya</button>
      {draft.kotor && <span className="text-xs text-amber-800">Draf belum disimpan</span>}
      <div className="flex gap-2">
        <button type="button" onClick={onNext} disabled={index >= total - 1} className="min-h-[44px] px-4 rounded-btn border border-bdi disabled:opacity-40">Lewati dulu</button>
        <button type="button" onClick={onSave} className="min-h-[44px] px-4 rounded-btn bg-pri text-white font-bold">{index < total - 1 ? 'Simpan & lanjut' : 'Simpan penilaian'}</button>
      </div>
    </div>
    {submitAttempted && !complete && <p role="alert" className="mt-3 text-xs text-danger flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Lengkapi seluruh kriteria, keputusan, dan komentar sebelum menyimpan.</p>}
    {complete && <p className="sr-only"><CheckCircle2 /> Siap disimpan</p>}
  </section>
);
