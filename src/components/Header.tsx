import React from 'react';
import {
  Boxes,
  Activity,
  LayoutDashboard,
  Kanban,
  Cpu,
  TableProperties,
  Container,
  Leaf,
  Atom,
  Shield,
  Play,
  Database,
  Languages,
  Moon,
  Sun,
} from 'lucide-react';
import { ActiveTab, FrontendFramework } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface HeaderProps {
  activeTab: ActiveTab;
  currentFramework: FrontendFramework;
  onOpenApiSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentFramework,
  onOpenApiSimulator,
}) => {
  const { language, toggleLanguage, isDarkTheme, toggleTheme, t } = useAppSettings();

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'k8s':
        return {
          title: t.header.titles.k8s,
          icon: <Boxes className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />,
          badge: t.header.badges.k8s,
        };
      case 'diagnostics':
        return {
          title: t.header.titles.diagnostics,
          icon: <Activity className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />,
          badge: t.header.badges.diagnostics,
        };
      case 'dashboard':
        return {
          title: t.header.titles.dashboard,
          icon: <LayoutDashboard className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />,
          badge: t.header.badges.dashboard,
        };
      case 'agile':
        return {
          title: t.header.titles.agile,
          icon: <Kanban className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />,
          badge: t.header.badges.agile,
        };
      case 'architecture':
        return {
          title: t.header.titles.architecture,
          icon: <Cpu className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />,
          badge: t.header.badges.architecture,
        };
      case 'matrix':
        return {
          title: t.header.titles.matrix,
          icon: <TableProperties className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />,
          badge: t.header.badges.matrix,
        };
      case 'database':
        return {
          title: t.header.titles.database,
          icon: <Database className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />,
          badge: t.header.badges.database,
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between gap-4 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 min-w-0">
          {info.icon}
          <span className="truncate">{info.title}</span>
        </h2>
        <span className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono whitespace-nowrap shrink-0">
          <span aria-hidden="true">·</span>
          <span>{info.badge}</span>
        </span>
      </div>

      {/* Quick Action Controls & Stack Metadata */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden 2xl:flex items-center gap-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{t.header.orchestrator}</span>
          <span className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-mono font-semibold">
            <Boxes className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> K8s v1.29
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{t.header.docker}</span>
          <span className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-mono font-semibold">
            <Container className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" /> {t.header.dockerEngine}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{t.header.backend}</span>
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
            <Leaf className="w-3.5 h-3.5" /> Spring Boot 3.2
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{t.header.frontend}</span>
          <span className="font-mono font-semibold flex items-center gap-1">
            {currentFramework === 'react' ? (
              <span className="text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <Atom className="w-3.5 h-3.5" /> React SPA
              </span>
            ) : (
              <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Angular 17
              </span>
            )}
          </span>
        </div>

        {/* Language Switcher (ES <-> EN) */}
        <button
          onClick={toggleLanguage}
          title={language === 'es' ? t.common.switchToEnglish : t.common.switchToSpanish}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Languages className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
          <span>{language === 'es' ? 'ES → EN' : 'EN → ES'}</span>
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDarkTheme ? t.common.switchToLight : t.common.switchToDark}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {isDarkTheme ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.common.lightMode}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-700" />
              <span>{t.common.darkMode}</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenApiSimulator}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{t.header.apiSimulatorBtn}</span>
        </button>
      </div>
    </header>
  );
};
