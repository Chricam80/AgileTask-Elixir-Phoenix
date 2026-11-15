import React, { useState } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';

export const VelocityChart: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const { t } = useAppSettings();

  const VELOCITY_DATA = [
    { sprint: 'Sprint 10', completed: 26, capacity: 30 },
    { sprint: 'Sprint 11', completed: 32, capacity: 34 },
    { sprint: 'Sprint 12', completed: 35, capacity: 36 },
    { sprint: 'Sprint 13', completed: 38, capacity: 38 },
    { sprint: `Sprint 14 ${t.velocityChart.sprintCurrentSuffix}`, completed: 30, capacity: 40 },
  ];

  const minVal = 20;
  const maxVal = 45;
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const getX = (index: number) => {
    return paddingX + (index * (width - paddingX * 2)) / (VELOCITY_DATA.length - 1);
  };

  const getY = (val: number) => {
    return height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
  };

  const completedPoints = VELOCITY_DATA.map((d, i) => `${getX(i)},${getY(d.completed)}`);
  const capacityPoints = VELOCITY_DATA.map((d, i) => `${getX(i)},${getY(d.capacity)}`);

  const completedArea = `M ${getX(0)},${getY(minVal)} L ${completedPoints.join(' L ')} L ${getX(VELOCITY_DATA.length - 1)},${getY(minVal)} Z`;
  const completedPath = `M ${completedPoints.join(' L ')}`;
  const capacityPath = `M ${capacityPoints.join(' L ')}`;

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Legend */}
      <div className="flex items-center justify-end gap-5 mb-2 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400"></span>
          <span className="text-zinc-700 dark:text-zinc-300">{t.velocityChart.legendCompleted}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 border-t-2 border-dashed border-amber-600 dark:border-amber-400"></span>
          <span className="text-amber-700 dark:text-amber-400">{t.velocityChart.legendCapacity}</span>
        </div>
      </div>

      <div className="relative w-full h-48 bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 border border-zinc-200 dark:border-zinc-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[20, 25, 30, 35, 40, 45].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={width - paddingX + 10}
                  y2={y}
                  className="stroke-zinc-300/70 dark:stroke-zinc-800"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingX - 15}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-zinc-500 font-mono text-[9px]"
                >
                  {level}
                </text>
              </g>
            );
          })}

          <path d={completedArea} fill="url(#velocityGrad)" />
          <path d={completedPath} fill="none" stroke="#0f766e" strokeWidth="2.5" />
          <path d={capacityPath} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5,4" />

          {VELOCITY_DATA.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.completed);
            const isHovered = hoveredPoint === i;

            return (
              <g
                key={d.sprint}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  className="fill-teal-700 dark:fill-teal-400 stroke-white dark:stroke-zinc-900 transition-all"
                  strokeWidth="2"
                />
                <circle
                  cx={cx}
                  cy={getY(d.capacity)}
                  r={3}
                  className="fill-amber-600 dark:fill-amber-400 stroke-white dark:stroke-zinc-900"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  className={`font-mono text-[9px] transition-colors ${
                    isHovered ? 'fill-teal-700 dark:fill-teal-400 font-bold' : 'fill-zinc-500 dark:fill-zinc-400'
                  }`}
                >
                  {d.sprint.replace(` ${t.velocityChart.sprintCurrentSuffix}`, '*')}
                </text>

                {isHovered && (
                  <g>
                    <rect
                      x={cx - 50}
                      y={cy - 38}
                      width="100"
                      height="28"
                      rx="6"
                      className="fill-white dark:fill-zinc-900 stroke-teal-600/60"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 24}
                      textAnchor="middle"
                      className="fill-zinc-900 dark:fill-zinc-50 font-mono text-[9px] font-bold"
                    >
                      {d.completed} SP ({Math.round((d.completed / d.capacity) * 100)}%)
                    </text>
                    <text
                      x={cx}
                      y={cy - 14}
                      textAnchor="middle"
                      className="fill-amber-700 dark:fill-amber-400 font-mono text-[8px]"
                    >
                      {t.velocityChart.capacityLabel}: {d.capacity} SP
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-mono flex items-center justify-between">
        <span>{t.velocityChart.footerNote}</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{t.velocityChart.avgVelocity}</span>
      </p>
    </div>
  );
};
