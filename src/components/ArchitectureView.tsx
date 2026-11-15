import React from 'react';
import {
  Leaf,
  Atom,
  Shield,
  Folder,
  Workflow,
  Terminal,
  Cpu,
} from 'lucide-react';
import { FrontendFramework } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface ArchitectureViewProps {
  currentFramework: FrontendFramework;
  onOpenApiSimulator: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  currentFramework,
  onOpenApiSimulator,
}) => {
  const { t } = useAppSettings();

  return (
    <div className="space-y-6">
      {/* Architecture Concept Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap font-mono text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{t.architecture.backendTag}</span>
            <span className="text-zinc-400">&harr;</span>
            <span
              className={`font-semibold ${
                currentFramework === 'react'
                  ? 'text-teal-700 dark:text-teal-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {t.architecture.frontendTagPrefix}{' '}
              {currentFramework === 'react' ? t.architecture.reactClient : t.architecture.angularClient}
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{t.architecture.bannerTitle}</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{t.architecture.bannerDesc}</p>
        </div>

        <button
          onClick={onOpenApiSimulator}
          className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Terminal className="w-4 h-4" />
          <span>{t.architecture.launchRestBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LADO BACKEND: SPRING BOOT */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t.architecture.backendCardTitle}</h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {t.architecture.backendCardSub}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {t.architecture.microservicesPill}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-bold border border-teal-200 dark:border-teal-800">
                    GET
                  </span>
                  <div>
                    <div className="text-xs font-mono text-zinc-800 dark:text-zinc-200">/api/v1/proyectos/metricas</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.architecture.ep1Desc}</div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">200 OK</span>
                  <div className="text-[10px] text-zinc-500">18ms</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    POST
                  </span>
                  <div>
                    <div className="text-xs font-mono text-zinc-800 dark:text-zinc-200">/api/v1/auth/login</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.architecture.ep2Desc}</div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">200 OK</span>
                  <div className="text-[10px] text-zinc-500">42ms</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
                    PUT
                  </span>
                  <div>
                    <div className="text-xs font-mono text-zinc-800 dark:text-zinc-200">/api/v1/kanban/tareas/{'{id}'}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.architecture.ep3Desc}</div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">200 OK</span>
                  <div className="text-[10px] text-zinc-500">24ms</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1.5">
              <div className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> {t.architecture.securityTitle}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-mono">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded text-zinc-700 dark:text-zinc-300">
                  {t.architecture.secCors}
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded text-zinc-700 dark:text-zinc-300">
                  {t.architecture.secCsrf}
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded text-zinc-700 dark:text-zinc-300">
                  {t.architecture.secAuth}
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded text-zinc-700 dark:text-zinc-300">
                  {t.architecture.secOrm}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">{t.architecture.jvmHeap}</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              {t.architecture.threadPool}
            </span>
          </div>
        </div>

        {/* LADO FRONTEND: REACT / ANGULAR */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                    currentFramework === 'react'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {currentFramework === 'react' ? <Atom className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {t.architecture.frontendCardTitle} (
                    {currentFramework === 'react' ? 'React 18 SPA' : 'Angular 17 Standalone'})
                  </h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {currentFramework === 'react' ? t.architecture.reactSub : t.architecture.angularSub}
                  </span>
                </div>
              </div>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  currentFramework === 'react'
                    ? 'text-teal-700 dark:text-teal-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {t.architecture.clientSidePill}
              </span>
            </div>

            <div className="p-3 bg-zinc-900 dark:bg-zinc-950 rounded-lg border border-zinc-300 dark:border-zinc-800 font-mono text-xs text-zinc-300 space-y-1.5">
              <div className="text-zinc-400 font-semibold text-[10px] uppercase font-sans pb-1 border-b border-zinc-800">
                {t.architecture.componentTreeTitle}
              </div>
              {currentFramework === 'react' ? (
                <>
                  <div className="flex items-center gap-2 text-teal-400">
                    <Folder className="w-3.5 h-3.5" />
                    <span>&lt;AppLayout&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-4">
                    <span className="text-zinc-600">&boxur;</span>
                    <span>&lt;NavigationSidebar /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-4">
                    <span className="text-zinc-600">&boxur;</span>
                    <span className="text-amber-300">&lt;KanbanBoardProvider&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-8">
                    <span className="text-zinc-600">&boxur;</span>
                    <span>&lt;KanbanColumn status="WIP" /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-12">
                    <span className="text-zinc-600">&boxur;</span>
                    <span className="text-emerald-300">&lt;TaskCard id={'{task.id}'} /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-4">
                    <span className="text-zinc-600">&boxur;</span>
                    <span>&lt;MetricsChart telemetry={'{data}'} /&gt;</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-rose-400">
                    <Folder className="w-3.5 h-3.5" />
                    <span>&lt;app-root [framework]="'angular'"&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-4">
                    <span className="text-zinc-600">&boxur;</span>
                    <span>&lt;app-sidebar-nav (onSelect)="nav($event)" /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-4">
                    <span className="text-zinc-600">&boxur;</span>
                    <span className="text-amber-300">&lt;app-kanban-board [tasks]="tasksSignal()"&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-8">
                    <span className="text-zinc-600">&boxur;</span>
                    <span>&lt;app-kanban-column [wipLimit]="3" /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-12">
                    <span className="text-zinc-600">&boxur;</span>
                    <span className="text-emerald-300">&lt;app-task-card *ngFor="let t of columnTasks" /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pl-4">
                    <span className="text-zinc-600">&boxur;</span>
                    <span>&lt;app-telemetry-chart [cluster]="k8sCluster()" /&gt;</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1.5">
              <div
                className={`${
                  currentFramework === 'react' ? 'text-teal-700 dark:text-teal-400' : 'text-rose-700 dark:text-rose-400'
                } font-semibold flex items-center gap-1.5`}
              >
                <Cpu className="w-3.5 h-3.5" /> {t.architecture.insightsTitle}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                {currentFramework === 'react' ? t.architecture.reactInsight : t.architecture.angularInsight}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.architecture.bundleSize} {currentFramework === 'react' ? '142 KB' : '178 KB'}
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              {t.architecture.lighthousePerf}
            </span>
          </div>
        </div>
      </div>

      {/* Cascading Value Chain Visualizer */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>{t.architecture.valueChainTitle}</span>
        </h4>
        <div className="flex flex-col gap-2.5">
          {t.architecture.phases.map((phase, index) => {
            const colorClasses = [
              'text-amber-700 dark:text-amber-400',
              'text-teal-700 dark:text-teal-400',
              'text-emerald-700 dark:text-emerald-400',
              'text-zinc-700 dark:text-zinc-300',
            ];
            const offsets = ['lg:ml-0 lg:mr-14', 'lg:ml-5 lg:mr-9', 'lg:ml-10 lg:mr-5', 'lg:ml-15 lg:mr-0'];
            return (
              <div
                key={phase.tag}
                className={`${offsets[index] || ''} p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
              >
                <div>
                  <span className={`text-[10px] font-mono font-bold ${colorClasses[index]}`}>{phase.tag}</span>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{phase.title}</h5>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 sm:text-right max-w-md">{phase.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
