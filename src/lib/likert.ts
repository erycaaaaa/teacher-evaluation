export type LikertDirection = 'positive' | 'negative';

export interface LikertConversionOptions {
  direction: LikertDirection;
  neutralThreshold?: number;
}

export function convertLikertToYesNo(
  score: unknown,
  options: LikertConversionOptions,
): 'YES' | 'NO' | null {
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 5) {
    return null;
  }

  const threshold = options.neutralThreshold ?? 3;
  if (score === 3) {
    if (threshold === 3) return null;
    return score >= threshold ? 'YES' : 'NO';
  }

  if (options.direction === 'positive') {
    return score >= threshold ? 'YES' : 'NO';
  }
  return score < threshold ? 'YES' : 'NO';
}
