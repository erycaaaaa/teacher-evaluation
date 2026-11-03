import React from 'react';
import { RubrikRow } from '../types';

export const RubrikTable: React.FC<{ rubrik: RubrikRow[] }> = ({ rubrik }) => {
  return (
    <div className="overflow-x-auto my-2 rounded-btn border border-bd bg-white">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-bg/60 border-b-2 border-bd text-mute text-xs uppercase tracking-wider font-semibold">
            <th className="py-2.5 px-3">Kriteria</th>
            <th className="py-2.5 px-3">Skor 1 (Kurang)</th>
            <th className="py-2.5 px-3">Skor 3 (Cukup)</th>
            <th className="py-2.5 px-3">Skor 5 (Baik)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bd text-tx">
          {rubrik.map((row, index) => (
              <tr key={`${row.kriteria}-${index}`} className="hover:bg-bg/30 transition-colors">
                <td className="py-2 px-3 font-semibold text-pri">{row.kriteria}</td>
                <td className="py-2 px-3 text-mute">{row.skor1}</td>
                <td className="py-2 px-3 text-mute">{row.skor3}</td>
                <td className="py-2 px-3 text-mute">{row.skor5}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
