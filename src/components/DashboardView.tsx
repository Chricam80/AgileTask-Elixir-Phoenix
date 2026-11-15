import React from 'react';
import {
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  Server,
  ShieldCheck,
  BarChart3,
  Box,
  Leaf,
  Atom,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { FrontendFramework } from '../types';
import { ComparativeChart } from './ComparativeChart';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface DashboardViewProps {
  currentFramework: FrontendFramework;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentFramework }) => {
  const { language, t } = useAppSettings();

  return (
    <div className="space-y-6">
      {/* Matte Editorial Context Banner (No blur-3xl orbs or indigo AI gradients) */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm dark:shadow-none">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.dashboard.kicker}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
            {t.dashboard.heroTitle}
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            {t.dashboard.heroDesc}
          </p>
        </div>
      </div>

      {/* Cascading KPI Measurement Waterfall (01 -> 02 -> 03 -> 04) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
          <span>{language === 'es' ? 'Cascada de Indicadores KPI' : 'KPI Measurement Cascade'}</span>
          <span>01 &rarr; 02 &rarr; 03 &rarr; 04</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* KPI 01 */}
          <div className="lg:ml-0 lg:mr-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">01</span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.dashboard.kpi1Label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.dashboard.kpi1Desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden md:block">
                <div className="bg-amber-600 dark:bg-amber-400 h-1.5 rounded-full" style={{ width: '88.4%' }}></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">88.4%</div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-end">
                  <ArrowUpRight className="w-3 h-3" /> {t.dashboard.kpi1Diff}
                </div>
              </div>
            </div>
          </div>

          {/* KPI 02 */}
          <div className="lg:ml-5 lg:mr-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">02</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.dashboard.kpi2Label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.dashboard.kpi2Desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden md:block">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">A+ (92/100)</div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-end">
                  <ArrowUpRight className="w-3 h-3" /> {t.dashboard.kpi2Diff}
                </div>
              </div>
            </div>
          </div>

          {/* KPI 03 */}
          <div className="lg:ml-10 lg:mr-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">03</span>
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.dashboard.kpi3Label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.dashboard.kpi3Desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden md:block">
                <div className="bg-teal-700 dark:bg-teal-400 h-1.5 rounded-full" style={{ width: '91%' }}></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">12.5k req/s</div>
                <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">{t.dashboard.kpi3Sub}</div>
              </div>
            </div>
          </div>

          {/* KPI 04 */}
          <div className="lg:ml-15 lg:mr-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">04</span>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.dashboard.kpi4Label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.dashboard.kpi4Desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden md:block">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full" style={{ width: '87.2%' }}></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">87.2%</div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{t.dashboard.kpi4Sub}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparative Chart & Technology Integration Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comparativa Antes vs Ahora */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.dashboard.chartTitle}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.dashboard.chartSub}</p>
              </div>
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">{t.dashboard.chartBadge}</span>
            </div>

            <div className="w-full">
              <ComparativeChart />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.dashboard.deploySpeedLabel}</div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {t.dashboard.deploySpeedVal}
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.dashboard.changeCostLabel}</div>
              <div className="text-xs font-bold text-teal-700 dark:text-teal-400 font-mono">{t.dashboard.changeCostVal}</div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.dashboard.clientSatLabel}</div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">{t.dashboard.clientSatVal}</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Stack Tecnológico */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-2">
              <Box className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              {t.dashboard.stackTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{t.dashboard.stackSub}</p>

            <div className="space-y-3">
              {/* Backend Component */}
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4" /> {t.dashboard.backendTitle}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                    {t.dashboard.backendBadge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{t.dashboard.backendDesc}</p>
              </div>

              {/* Frontend Component */}
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      currentFramework === 'react'
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {currentFramework === 'react' ? (
                      <>
                        <Atom className="w-4 h-4" /> {t.dashboard.reactTitle}
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" /> {t.dashboard.angularTitle}
                      </>
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      currentFramework === 'react'
                        ? 'text-teal-700 dark:text-teal-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {currentFramework === 'react' ? t.dashboard.reactBadge : t.dashboard.angularBadge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {currentFramework === 'react' ? t.dashboard.reactDesc : t.dashboard.angularDesc}
                </p>
              </div>

              {/* Agile Driver */}
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4" /> {t.dashboard.agileTitle}
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-semibold">
                    {t.dashboard.agileBadge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{t.dashboard.agileDesc}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>{t.dashboard.commProto}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">{t.common.connected}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
