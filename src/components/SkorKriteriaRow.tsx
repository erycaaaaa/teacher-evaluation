import React from 'react';
import { NilaiSkor, RubrikRow } from '../types';

interface SkorKriteriaRowProps {
  criteria: RubrikRow;
  score: NilaiSkor | undefined;
  answerLabel: string;
  onSelect: (score: NilaiSkor) => void;
}

export const SkorKriteriaRow: React.FC<SkorKriteriaRowProps> = ({
  criteria,
  score,
  answerLabel,
  onSelect,
}) => {
  const description = score === 1 ? criteria.skor1
    : score === 3 ? criteria.skor3
    : score === 5 ? criteria.skor5
    : score === 2 ? 'Di antara skor 1 dan 3'
    : score === 4 ? 'Di antara skor 3 dan 5'
    : '';

  return (
    <div className="py-2 border-t border-bd">
      <div className="text-[13px] font-medium text-tx mb-1">{criteria.kriteria}</div>
      <div className="flex gap-1.5" role="group" aria-label={`${criteria.kriteria} untuk ${answerLabel}`}>
        {([1, 2, 3, 4, 5] as const).map(value => (
          <button
            key={value}
            type="button"
            aria-pressed={score === value}
            aria-label={`${criteria.kriteria} skor ${value}`}
            onClick={() => onSelect(value)}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-btn border text-sm flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              score === value
                ? 'bg-pri text-white border-pri font-bold'
                : 'bg-white text-tx border-bdi font-medium hover:bg-tint hover:border-pri/40'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      {description && <p className="mt-1 text-xs text-mute">{description}</p>}
    </div>
  );
};
