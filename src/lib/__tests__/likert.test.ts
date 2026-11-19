import { describe, expect, it } from 'vitest';
import { convertLikertToYesNo } from '../likert';

describe('konversi Likert menjadi YES/NO', () => {
  it('mengonversi skor positif dan negatif', () => {
    expect(convertLikertToYesNo(1, { direction: 'positive' })).toBe('NO');
    expect(convertLikertToYesNo(5, { direction: 'positive' })).toBe('YES');
    expect(convertLikertToYesNo(1, { direction: 'negative' })).toBe('YES');
    expect(convertLikertToYesNo(5, { direction: 'negative' })).toBe('NO');
  });

  it('mempertahankan skor netral tanpa asumsi threshold', () => {
    expect(convertLikertToYesNo(3, { direction: 'positive' })).toBeNull();
  });

  it('menggunakan threshold yang dikonfigurasi', () => {
    expect(convertLikertToYesNo(3, { direction: 'positive', neutralThreshold: 4 })).toBe('NO');
    expect(convertLikertToYesNo(4, { direction: 'positive', neutralThreshold: 4 })).toBe('YES');
  });

  it('menolak nilai kosong dan di luar rentang', () => {
    expect(convertLikertToYesNo(undefined, { direction: 'positive' })).toBeNull();
    expect(convertLikertToYesNo(0, { direction: 'positive' })).toBeNull();
    expect(convertLikertToYesNo(6, { direction: 'positive' })).toBeNull();
  });
});
