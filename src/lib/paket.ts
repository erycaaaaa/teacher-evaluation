import { PaketTugas, Tugas } from '../types';

export interface ParsePaketGuruResult {
  sukses: boolean;
  pesan?: string;
  paket?: PaketTugas;
}

export function validatePaketGuru(jsonString: string): ParsePaketGuruResult {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { sukses: false, pesan: 'File paket tidak valid (bukan objek JSON).' };
    }

    const candidate = parsed as Record<string, unknown>;
    const { versi, dibuat, tugas, set, siklus } = candidate;
    if (versi !== 2 || typeof dibuat !== 'string' || !dibuat.trim()) {
      return { sukses: false, pesan: 'Paket harus memakai format versi 2 dan memiliki waktu pembuatan.' };
    }
    if (set !== 'validasi' && set !== 'final_test') {
      return { sukses: false, pesan: 'Nilai "set" paket harus "validasi" atau "final_test".' };
    }
    if (!Number.isInteger(siklus) || typeof siklus !== 'number' || siklus < 1) {
      return { sukses: false, pesan: 'Field "siklus" harus berupa bilangan bulat positif.' };
    }
    if (!Array.isArray(tugas) || tugas.length === 0) {
      return { sukses: false, pesan: 'Paket tidak valid: daftar tugas kosong.' };
    }

    const idSet = new Set<string>();
    const validatedTasks: Tugas[] = [];
    const requiredTextFields = ['id', 'pertanyaan', 'acuan', 'context', 'varian', 'sft', 'dpo'] as const;
    for (const [index, value] of tugas.entries()) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { sukses: false, pesan: `Tugas pada indeks ${index} bukan objek yang valid.` };
      }
      const task = value as Record<string, unknown>;
      for (const field of requiredTextFields) {
        if (typeof task[field] !== 'string' || !task[field].trim()) {
          return {
            sukses: false,
            pesan: `Paket tidak valid: field "${field}" wajib berupa teks tidak kosong pada tugas indeks ${index}.`,
          };
        }
      }
      if (typeof task.kelas !== 'string' && typeof task.kelas !== 'number') {
        return { sukses: false, pesan: `Field "kelas" tugas indeks ${index} harus berupa teks atau angka.` };
      }
      if (typeof task.identik !== 'boolean') {
        return { sukses: false, pesan: `Field "identik" tugas indeks ${index} wajib berupa boolean.` };
      }

      const id = task.id as string;
      if (idSet.has(id)) {
        return { sukses: false, pesan: `Paket tidak valid: terdapat ID duplikat "${id}".` };
      }
      idSet.add(id);
      validatedTasks.push({
        id,
        kelas: task.kelas,
        pertanyaan: task.pertanyaan as string,
        acuan: task.acuan as string,
        context: task.context as string,
        varian: task.varian as string,
        sft: task.sft as string,
        dpo: task.dpo as string,
        identik: task.identik,
      });
    }

    return {
      sukses: true,
      paket: {
        versi: 2,
        dibuat,
        set,
        siklus,
        tugas: validatedTasks,
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Periksa format file.';
    return { sukses: false, pesan: `File tidak dapat dibaca sebagai JSON: ${reason}` };
  }
}
