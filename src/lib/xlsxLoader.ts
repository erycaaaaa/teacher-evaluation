let cache: Promise<typeof import('xlsx')> | null = null;

/**
 * Muat library SheetJS (xlsx) secara dinamis (lazy load)
 * agar ukuran bundle utama (initial chunk) tetap kecil (<500 kB).
 */
export function muatXlsx(): Promise<typeof import('xlsx')> {
  return (cache ??= import('xlsx'));
}
