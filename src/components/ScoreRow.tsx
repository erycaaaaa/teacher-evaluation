import React from 'react';

interface ScoreRowProps {
  kriteriaIndex: number;
  kriteriaName: string;
  isOptional: boolean;
  score: number | undefined;
  onSelectScore: (score: number) => void;
  targetLabel: string;
  hasError: boolean;
}

export const ScoreRow: React.FC<ScoreRowProps> = ({
  kriteriaIndex: _kriteriaIndex,
  kriteriaName,
  isOptional,
  score,
  onSelectScore,
  targetLabel,
  hasError,
}) => {
  const showError = hasError && !isOptional && !score;

  return (
    <div className={`py-2 border-t border-bd flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${showError ? 'text-danger' : ''}`}>
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-semibold ${showError ? 'text-danger' : 'text-tx'}`}>
          {kriteriaName}
        </span>
        {isOptional && (
          <span className="text-xs text-mute font-normal italic">
            (opsional)
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label={`${kriteriaName} untuk ${targetLabel}`}
        >
          {[1, 2, 3, 4, 5].map(num => {
            const isSelected = score === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onSelectScore(num)}
                aria-pressed={isSelected}
                aria-label={`${kriteriaName} skor ${num}`}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-btn font-semibold text-sm transition-all flex items-center justify-center border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'bg-pri text-white border-pri shadow-sm font-bold scale-[1.03]'
                    : 'bg-white text-tx border-bdi hover:bg-tint hover:border-pri/40'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        {showError && (
          <span className="text-xs font-semibold text-danger self-end animate-fadeIn">
            wajib diisi
          </span>
        )}
      </div>
    </div>
  );
};
