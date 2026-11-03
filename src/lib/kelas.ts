export const extractKelasNum = (val: string | number | null | undefined): number | null => {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val >= 1 && val <= 6 ? val : null;
  }

  if (typeof val !== 'string') return null;
  const match = val.match(/\d+/);
  if (!match) return null;
  const kelas = Number(match[0]);
  return Number.isInteger(kelas) && kelas >= 1 && kelas <= 6 ? kelas : null;
};
