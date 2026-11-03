import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Download, Upload } from 'lucide-react';
import { PaketTugas } from '../types';
import { validatePaketGuru } from '../lib/paket';
import { parseFeedbackFile } from '../lib/feedback';
import { hash } from '../lib/blind';
import { unduhBerkasCadangan, pulihkanCadanganData } from '../lib/backup';
import { AnotasiGuruPage } from './AnotasiGuruPage';
import { EvaluasiGuruPage } from './EvaluasiGuruPage';
import { FeedbackRow } from '../lib/feedback';
import { RubrikRow, SkorJawaban } from '../types';

type GuruMode = 'anotasi' | 'evaluasi';

const LS_MODE = 'qb_guru_mode_v1';
const LS_ANNOTATION_TEMPLATE = 'qb_guru_anotasi_template_v1';
const LS_ANNOTATION_ROWS = 'qb_guru_anotasi_rows_v1';
const LS_ANNOTATION_RUBRIK = 'qb_guru_anotasi_rubrik_v1';
const LS_ANNOTATION_SKOR = 'qb_guru_anotasi_skor_v1';
const LS_ANNOTATION_WARNINGS = 'qb_guru_anotasi_warnings_v1';
const LS_EVALUATION_PACKAGE = 'qb_guru_eval_paket_v1';
const LS_EVALUATION_DATA = 'qb_guru_eval_data_v1';
const LS_ANNOTATION_EXPORT = 'qb_guru_anotasi_export_snapshot_v1';
const LS_EVALUATION_EXPORT = 'qb_guru_eval_export_snapshot_v1';

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return fallback;
  }
}

function currentMode(): GuruMode | null {
  const mode = localStorage.getItem(LS_MODE);
  return mode === 'anotasi' || mode === 'evaluasi' ? mode : null;
}

function modeHasUnexportedChanges(mode: GuruMode | null): boolean {
  if (mode === 'anotasi') {
    const rows = readStoredJson<FeedbackRow[]>(LS_ANNOTATION_ROWS, []);
    const skor = readStoredJson<Record<string, SkorJawaban>>(LS_ANNOTATION_SKOR, {});
    const rubrik = readStoredJson<RubrikRow[]>(LS_ANNOTATION_RUBRIK, []);
    const hasRatings = rows.some(row => row.status === 'Yes' || row.status === 'No') ||
      Object.keys(skor).length > 0;
    return hasRatings && JSON.stringify({ rows, skor, rubrik }) !== localStorage.getItem(LS_ANNOTATION_EXPORT);
  }
  if (mode === 'evaluasi') {
    const data = readStoredJson<{
      hasil?: Record<string, unknown>;
      draf?: Record<string, { kotor?: boolean }>;
    }>(LS_EVALUATION_DATA, {});
    const results = data.hasil ?? {};
    const dirtyDraft = Object.values(data.draf ?? {}).some(draft => draft.kotor);
    return dirtyDraft ||
      (Object.keys(results).length > 0 && JSON.stringify(results) !== localStorage.getItem(LS_EVALUATION_EXPORT));
  }
  return false;
}

function modeHasData(mode: GuruMode | null): boolean {
  if (mode === 'anotasi') return Boolean(localStorage.getItem(LS_ANNOTATION_TEMPLATE));
  if (mode === 'evaluasi') return Boolean(localStorage.getItem(LS_EVALUATION_PACKAGE));
  return false;
}

function getStoredPackage(mode: GuruMode | null): PaketTugas | null {
  if (mode !== 'evaluasi') return null;
  const saved = localStorage.getItem(LS_EVALUATION_PACKAGE);
  if (!saved) return null;
  const result = validatePaketGuru(saved);
  if (!result.sukses || !result.paket) {
    console.error('Paket evaluasi yang tersimpan tidak valid:', result.pesan);
    return null;
  }
  return result.paket;
}

export const GuruPage: React.FC = () => {
  const [mode, setMode] = useState<GuruMode | null>(() => currentMode());
  const [paket, setPaket] = useState<PaketTugas | null>(() => getStoredPackage(currentMode()));
  const [warningMessages, setWarningMessages] = useState<string[]>(() =>
    readStoredJson(LS_ANNOTATION_WARNINGS, [])
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  const [loadedFileKey, setLoadedFileKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/guru';
  }, []);

  const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setFileError(null);
    setFileSuccess(null);
    setFileWarning(null);
    const extension = file.name.split('.').pop()?.toLowerCase();
    const targetMode: GuruMode | null =
      extension === 'json' ? 'evaluasi' :
      extension === 'xlsx' || extension === 'csv' ? 'anotasi' : null;
    if (!targetMode) {
      setFileError('Format file tidak didukung. Pilih template anotasi .xlsx/.csv atau paket evaluasi .json.');
      return;
    }

    const previousMode = currentMode();
    if (
      previousMode &&
      previousMode !== targetMode &&
      modeHasData(previousMode) &&
      !window.confirm(
        modeHasUnexportedChanges(previousMode)
          ? 'Ada penilaian mode aktif yang belum diekspor. Ekspor hasil atau cadangkan data terlebih dahulu. Data kedua mode tetap disimpan terpisah. Tetap lanjut?'
          : 'Anda akan berpindah jenis tugas. Data setiap mode disimpan terpisah; ekspor atau cadangkan data sebelum melanjutkan. Tetap lanjut?'
      )
    ) {
      return;
    }

    if (targetMode === 'evaluasi') {
      try {
        const result = validatePaketGuru(await file.text());
        if (!result.sukses || !result.paket) {
          setFileError(result.pesan || 'Paket evaluasi tidak valid.');
          return;
        }
        const previousPackage = localStorage.getItem(LS_EVALUATION_PACKAGE);
        const newPackage = JSON.stringify(result.paket);
        if (
          previousPackage &&
          previousPackage !== newPackage &&
          !window.confirm('Paket evaluasi berbeda dari file tersimpan. Data mode evaluasi sebelumnya akan diganti. Ekspor hasil atau cadangkan data terlebih dahulu. Lanjutkan?')
        ) {
          return;
        }
        if (previousPackage !== newPackage) {
          localStorage.removeItem(LS_EVALUATION_DATA);
          localStorage.removeItem(LS_EVALUATION_EXPORT);
        }
        localStorage.setItem(LS_EVALUATION_PACKAGE, newPackage);
        localStorage.setItem(LS_MODE, 'evaluasi');
        setPaket(result.paket);
        setMode('evaluasi');
        setWarningMessages([]);
        setLoadedFileKey(key => key + 1);
        setFileSuccess(`Paket ${result.paket.set} berhasil dimuat (${result.paket.tugas.length} tugas).`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Format file tidak dapat dibaca.';
        setFileError(`Gagal membaca paket evaluasi: ${reason}`);
      }
      return;
    }

    const result = await parseFeedbackFile(file);
    if (result.error || !result.rows) {
      setFileError(result.error || 'Template Feedback tidak valid.');
      return;
    }
    const existingTemplate = localStorage.getItem(LS_ANNOTATION_TEMPLATE);
    const templateIdentity = `${file.name}:${hash(JSON.stringify(result.rows.map(row => [
      row.id, row.kelas, row.pertanyaan, row.context, row.jawaban,
    ])), 'feedback-template-')}`;
    const storedRubrik = localStorage.getItem(LS_ANNOTATION_RUBRIK);
    const nextRubrik = result.rubrik ?? [];
    const rubrikChanged = storedRubrik !== null &&
      JSON.stringify(readStoredJson<RubrikRow[]>(LS_ANNOTATION_RUBRIK, nextRubrik)) !== JSON.stringify(nextRubrik);
    const existingSkor = readStoredJson<Record<string, SkorJawaban>>(LS_ANNOTATION_SKOR, {});
    const nextSkor = result.skor ?? {};
    const skorChanged = JSON.stringify(existingSkor) !== JSON.stringify(nextSkor);
    const existingRows = readStoredJson<FeedbackRow[]>(LS_ANNOTATION_ROWS, []);
    const existingHasRatings = existingRows.some(row => row.status === 'Yes' || row.status === 'No') ||
      Object.keys(existingSkor).length > 0;
    if (
      existingTemplate &&
      (existingTemplate !== templateIdentity || rubrikChanged || skorChanged) &&
      (!window.confirm(
        existingHasRatings
          ? 'Template anotasi berbeda dan ada penilaian tersimpan. Ekspor hasil atau cadangkan data terlebih dahulu. Ganti template dan penilaian mode anotasi?'
          : 'Template anotasi berbeda dari file tersimpan. Ganti template mode anotasi?'
      ))
    ) {
      return;
    }

    localStorage.setItem(LS_ANNOTATION_TEMPLATE, templateIdentity);
    const rowsToUse = existingTemplate === templateIdentity && !rubrikChanged ? existingRows : result.rows;
    localStorage.setItem(LS_ANNOTATION_ROWS, JSON.stringify(rowsToUse));
    localStorage.setItem(LS_ANNOTATION_RUBRIK, JSON.stringify(nextRubrik));
    localStorage.setItem(LS_ANNOTATION_SKOR, JSON.stringify(nextSkor));
    localStorage.setItem(LS_ANNOTATION_WARNINGS, JSON.stringify(result.warnings));
    if (existingTemplate !== templateIdentity || rubrikChanged || skorChanged) {
      localStorage.removeItem(LS_ANNOTATION_EXPORT);
    }
    localStorage.setItem(LS_MODE, 'anotasi');
    setMode('anotasi');
    setPaket(null);
    setWarningMessages(result.warnings);
    setLoadedFileKey(key => key + 1);
    const parseWarnings = [result.rubrikWarning, result.skorWarning].filter(Boolean);
    setFileWarning(parseWarnings.length ? parseWarnings.join(' ') : null);
    setFileSuccess(`Template Feedback berhasil dimuat (${result.groups?.length ?? 0} ID).`);
  };

  const handleBackup = () => {
    try {
      unduhBerkasCadangan();
      setFileSuccess('Cadangan data Guru berhasil diunduh.');
      setFileError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Terjadi kesalahan.';
      setFileError(`Gagal membuat cadangan: ${reason}`);
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = loadEvent => {
      const result = pulihkanCadanganData(String(loadEvent.target?.result ?? ''));
      if (!result.sukses) {
        setFileError(result.pesan);
        return;
      }
      window.location.reload();
    };
    reader.onerror = () => setFileError('Gagal membaca file cadangan.');
    reader.readAsText(file);
  };

  const modeLabel = mode === 'anotasi'
    ? 'Mode: Anotasi (Yes/No)'
    : mode === 'evaluasi'
    ? 'Mode: Evaluasi (A/B, 5 kriteria)'
    : 'Mode belum dipilih';

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      <section className="p-5 rounded-card bg-white border border-bd shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong className="text-sm font-bold text-pri">{modeLabel}</strong>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 min-h-[44px] rounded-btn border border-pri text-pri font-bold text-xs flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Muat tugas
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,.json"
              className="hidden"
              onChange={handleLoadFile}
            />
            <button
              type="button"
              onClick={handleBackup}
              className="px-3 py-2 min-h-[44px] rounded-btn border border-bdi text-tx font-semibold text-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Cadangkan data (.json)
            </button>
            <label className="px-3 py-2 min-h-[44px] rounded-btn border border-bdi bg-white text-tx font-semibold text-xs flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-mute" />
              Pulihkan cadangan
              <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
            </label>
          </div>
        </div>
        <p className="text-xs text-mute mt-2">
          .xlsx/.csv memuat template anotasi; .json memuat paket evaluasi validasi atau final test.
        </p>
        <div className="mt-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span><strong>Data tersimpan di browser ini.</strong> Ekspor .xlsx dan cadangkan .json secara berkala. Jangan hapus data browser sebelum mengekspor.</span>
        </div>
        {fileError && <p role="alert" className="mt-3 text-xs font-semibold text-danger">{fileError}</p>}
        {fileSuccess && <p role="status" className="mt-3 text-xs font-semibold text-pri">{fileSuccess}</p>}
        {fileWarning && (
          <p role="status" className="mt-3 p-3 rounded-card bg-amber-50 border border-amber-300 text-amber-900 text-xs">
            {fileWarning}
          </p>
        )}
      </section>

      {mode === 'anotasi' ? (
        <AnotasiGuruPage key={loadedFileKey} warningMessages={warningMessages} />
      ) : mode === 'evaluasi' && paket ? (
        <EvaluasiGuruPage key={JSON.stringify(paket)} paket={paket} />
      ) : (
        <div className="p-8 text-center text-mute bg-white rounded-card border border-bd">
          Belum ada tugas. Muat file template anotasi (.xlsx) atau paket evaluasi (.json).
        </div>
      )}
    </div>
  );
};
