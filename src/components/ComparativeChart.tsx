import React, { useState } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface MetricComparison {
  key: 'deliverySpeed' | 'maintainability' | 'scalability' | 'testCoverage' | 'satisfaction';
  tradicional: number;
  moderno: number;
  unit: string;
  diff: string;
}

const COMPARISON_DATA: MetricComparison[] = [
  { key: 'deliverySpeed', tradicional: 24, moderno: 88, unit: '/100', diff: '+266%' },
  { key: 'maintainability', tradicional: 38, moderno: 92, unit: '/100', diff: '+142%' },
  { key: 'scalability', tradicional: 30, moderno: 91, unit: '/100', diff: '+203%' },
  { key: 'testCoverage', tradicional: 18, moderno: 87, unit: '%', diff: '+383%' },
  { key: 'satisfaction', tradicional: 45, moderno: 93, unit: '/100', diff: '+106%' },
];

export const ComparativeChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { t } = useAppSettings();

  return (
    <div className="w-full flex flex-col h-full justify-between">
      <div className="flex items-center justify-end gap-5 mb-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-zinc-400 dark:bg-zinc-600"></span>
          <span className="text-zinc-600 dark:text-zinc-400">{t.comparativeChart.legendTraditional}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-teal-700 dark:bg-teal-400"></span>
          <span className="text-teal-700 dark:text-teal-400 font-medium">{t.comparativeChart.legendModern}</span>
        </div>
      </div>

      <div className="space-y-3 py-1">
        {COMPARISON_DATA.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const label = t.comparativeChart.metrics[item.key];
          return (
            <div
              key={item.key}
              className={`p-2.5 rounded-lg transition-colors border ${
                isHovered
                  ? 'bg-zinc-100 dark:bg-zinc-800/70 border-teal-500/50 dark:border-teal-500/40'
                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-zinc-800 dark:text-zinc-200">{label}</span>
                <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {item.tradicional}
                    {item.unit}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">&rarr;</span>
                  <span className="text-teal-700 dark:text-teal-400 font-bold">
                    {item.moderno}
                    {item.unit}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{item.diff}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden flex items-center">
                  <div
                    className="bg-zinc-400 dark:bg-zinc-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.tradicional}%` }}
                  ></div>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden flex items-center">
                  <div
                    className="bg-teal-700 dark:bg-teal-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.moderno}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
        <span>{t.comparativeChart.footerSource}</span>
        <span>{t.comparativeChart.footerScale}</span>
      </div>
    </div>
  );
};
