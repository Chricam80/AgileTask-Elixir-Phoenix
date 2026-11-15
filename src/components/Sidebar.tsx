import React from 'react';
import {
  Boxes,
  Activity,
  Atom,
  Shield,
  LayoutDashboard,
  Kanban,
  Cpu,
  TableProperties,
  Layers,
  HardDrive,
  Moon,
  Sun,
  Database,
} from 'lucide-react';
import { ActiveTab, FrontendFramework } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentFramework: FrontendFramework;
  onFrameworkChange: (fw: FrontendFramework) => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  totalPods: number;
  cpuUsedCores: number;
  ramUsedGb: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentFramework,
  onFrameworkChange,
  isDarkTheme,
  onToggleTheme,
  totalPods,
  cpuUsedCores,
  ramUsedGb,
}) => {
  const { t } = useAppSettings();

  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col flex-shrink-0 z-20 transition-colors select-none">
      {/* Brand Header with Architectural BrandLogo */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <BrandLogo className="w-10 h-10 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>DevAgile</span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono font-semibold">v3.5</span>
            </h1>
            <p
              className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[175px]"
              title={t.sidebar.researchSubtitle}
            >
              {t.sidebar.researchSubtitle}
            </p>
          </div>
        </div>
        <div className="mt-3 text-[11px] bg-zinc-50 dark:bg-zinc-950 rounded-lg p-2.5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 leading-relaxed">
          <span className="text-teal-700 dark:text-teal-400 font-semibold">{t.sidebar.thesisLabel}</span>{' '}
          {t.sidebar.thesisDesc}
        </div>
      </div>

      {/* Active Frontend Switcher */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">
          {t.sidebar.activeFrontend}
        </label>
        <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => onFrameworkChange('react')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              currentFramework === 'react'
                ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-sm border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>React 18</span>
          </button>
          <button
            onClick={() => onFrameworkChange('angular')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              currentFramework === 'angular'
                ? 'bg-white dark:bg-zinc-800 text-rose-700 dark:text-rose-400 shadow-sm border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Angular 17</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
          {t.sidebar.platformModules}
        </div>

        {/* Tab 1: K8s & Microservicios */}
        <button
          onClick={() => onTabChange('k8s')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'k8s'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <Boxes
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'k8s' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight flex items-center justify-between gap-1.5">
              <span className="font-semibold">{t.sidebar.nav.k8sTitle}</span>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">v1.29</span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.k8sSub}</span>
          </div>
        </button>

        {/* Tab 2: Stress Test, OS Analysis & Updates */}
        <button
          onClick={() => onTabChange('diagnostics')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'diagnostics'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <Activity
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'diagnostics' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight font-semibold">{t.sidebar.nav.diagnosticsTitle}</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.diagnosticsSub}</span>
          </div>
        </button>

        {/* Tab 3: Dashboard General */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'dashboard'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <LayoutDashboard
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'dashboard' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight font-semibold">{t.sidebar.nav.dashboardTitle}</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.dashboardSub}</span>
          </div>
        </button>

        {/* Tab 4: Gestión Ágil */}
        <button
          onClick={() => onTabChange('agile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'agile'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <Kanban
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'agile' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight font-semibold">{t.sidebar.nav.agileTitle}</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.agileSub}</span>
          </div>
        </button>

        {/* Tab 5: Arquitectura & Tech */}
        <button
          onClick={() => onTabChange('architecture')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'architecture'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <Cpu
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'architecture' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight font-semibold">{t.sidebar.nav.archTitle}</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.archSub}</span>
          </div>
        </button>

        {/* Tab 6: Matriz de Coherencia */}
        <button
          onClick={() => onTabChange('matrix')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'matrix'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <TableProperties
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'matrix' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight font-semibold">{t.sidebar.nav.matrixTitle}</div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.matrixSub}</span>
          </div>
        </button>

        {/* Tab 7: Base de Datos & Alimentador */}
        <button
          onClick={() => onTabChange('database')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
            activeTab === 'database'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent'
          }`}
        >
          <Database
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'database' ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <div className="flex-1 truncate">
            <div className="leading-tight font-semibold flex items-center justify-between gap-1.5">
              <span>{t.sidebar.nav.dbTitle}</span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                {t.sidebar.nav.dbLiveBadge}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.sidebar.nav.dbSub}</span>
          </div>
        </button>

        {/* Live Telemetry Widget */}
        <div className="pt-4 px-3 pb-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
          {t.sidebar.telemetryTitle}
        </div>
        <div className="mx-1 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-2 font-mono">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> {t.sidebar.cpuCluster}
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold tabular-nums">
              {cpuUsedCores} / 16 {t.sidebar.coresUnit}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" /> {t.sidebar.ramCluster}
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold tabular-nums">{ramUsedGb} / 64 GB</span>
          </div>
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> {t.sidebar.healthyPods}
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
              {totalPods} / {totalPods}
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-700 dark:bg-teal-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((cpuUsedCores / 16) * 100)}%` }}
            ></div>
          </div>
        </div>
      </nav>

      {/* Footer Author & Theme */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center font-bold text-xs text-white dark:text-zinc-900 shrink-0 font-mono">
            CS
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">Christian Sandoval</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{t.common.authorRole}</div>
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
          title={isDarkTheme ? t.common.switchToLight : t.common.switchToDark}
          aria-label={isDarkTheme ? t.common.switchToLight : t.common.switchToDark}
        >
          {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
        </button>
      </div>
    </aside>
  );
};
