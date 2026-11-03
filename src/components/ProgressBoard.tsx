import React from 'react';

export interface ProgressBoardItem {
  kelas: number;
  totalTugas: number;
  tugasDinilai: number;
  isMyClass?: boolean;
}

interface ProgressBoardProps {
  items: ProgressBoardItem[];
}

export const ProgressBoard: React.FC<ProgressBoardProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map(item => {
        const { kelas, totalTugas, tugasDinilai, isMyClass } = item;
        const pct = totalTugas > 0 ? Math.round((tugasDinilai / totalTugas) * 100) : 0;

        let statusText = 'Belum ada data';
        let isWarn = false;

        if (totalTugas === 0) {
          statusText = 'Belum ada data';
        } else if (tugasDinilai >= totalTugas) {
          statusText = 'Selesai';
        } else {
          statusText = 'Sedang berjalan';
        }

        return (
          <div
            key={kelas}
            className={`rounded-btn p-3 border transition-all ${
              isMyClass
                ? 'bg-tint/70 border-2 border-pri shadow-sm'
                : 'bg-white border-bd hover:border-bdi'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-bold text-sm text-tx">Kelas {kelas}</span>
              {isMyClass && (
                <span className="text-[10px] font-bold bg-pri text-white px-1.5 py-0.5 rounded-full">
                  Kelas saya
                </span>
              )}
            </div>

            <div className="text-xs text-mute font-medium">
              {tugasDinilai} / {totalTugas} dinilai
            </div>

            <div
              className="h-2 rounded-full bg-bd/60 overflow-hidden my-1.5"
              role="progressbar"
              aria-valuenow={tugasDinilai}
              aria-valuemin={0}
              aria-valuemax={totalTugas}
              aria-label={`Progres Kelas ${kelas}`}
            >
              <div
                className="h-full bg-pri rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div
              className={`text-[11px] font-medium leading-tight ${
                isWarn ? 'text-kuning-warn font-semibold' : 'text-mute'
              }`}
            >
              {statusText}
            </div>
          </div>
        );
      })}
    </div>
  );
};
