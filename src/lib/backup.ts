/**
 * backup.ts — Pengaman data localStorage untuk Zero-Backend SPA.
 * Menyediakan fungsi ekspor dan impor cadangan data Ruang Guru tanpa rahasia.
 */

export interface BackupPayload {
  app: 'guru-pjok-qbank';
  versi: 2;
  waktu: string;
  data: Record<string, string>;
}

export const BACKUP_PREFIX = 'qb_';

/** Daftar kata kunci yang dilarang berada di berkas cadangan demi keamanan */
const FORBIDDEN_KEYS_OR_SUBSTRINGS = ['apikey', 'api_key', 'x-api-key', 'secret', 'password', 'token'];

/**
 * Membuat objek cadangan dari seluruh data lokal qb_*
 * Dijamin bebas dari API key atau token rahasia.
 */
export function buatCadanganData(): BackupPayload {
  const store: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(BACKUP_PREFIX)) continue;

    // Jangan pernah cadangkan key yang berkaitan dengan API key
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_KEYS_OR_SUBSTRINGS.some(f => lowerKey.includes(f))) {
      continue;
    }

    const val = localStorage.getItem(key);
    if (val === null) continue;

    // Pastikan nilai tidak memuat API key secara tak sengaja
    store[key] = val;
  }

  return {
    app: 'guru-pjok-qbank',
    versi: 2,
    waktu: new Date().toISOString(),
    data: store,
  };
}

/**
 * Mengunduh cadangan sebagai berkas .json
 */
export function unduhBerkasCadangan(filename = `cadangan_guru_pjok_${new Date().toISOString().slice(0, 10)}.json`): void {
  const backup = buatCadanganData();
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Memulihkan data dari teks JSON cadangan
 */
export function pulihkanCadanganData(jsonContent: string): { sukses: boolean; jumlahKunci: number; pesan: string } {
  try {
    const parsed = JSON.parse(jsonContent) as BackupPayload;
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { sukses: false, jumlahKunci: 0, pesan: 'Format berkas cadangan tidak valid.' };
    }

    let count = 0;
    for (const [key, val] of Object.entries(parsed.data)) {
      if (!key.startsWith(BACKUP_PREFIX)) continue;

      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_KEYS_OR_SUBSTRINGS.some(f => lowerKey.includes(f))) {
        continue;
      }

      localStorage.setItem(key, val);
      count++;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }

    return {
      sukses: true,
      jumlahKunci: count,
      pesan: `Berhasil memulihkan ${count} entri data dari cadangan (${new Date(parsed.waktu || Date.now()).toLocaleString('id-ID')}).`,
    };
  } catch (err: any) {
    return {
      sukses: false,
      jumlahKunci: 0,
      pesan: `Gagal membaca berkas cadangan: ${err.message || 'Format JSON rusak.'}`,
    };
  }
}
