import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  FileCode,
  Scale,
  Activity,
  Cpu,
  HardDrive,
  Layers,
  Container,
  RefreshCw,
  Terminal,
  FileText,
  Network,
  Monitor,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Microservice, PodInfo, FrontendFramework } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface K8sMonitorViewProps {
  microservices: Microservice[];
  pods: Record<string, PodInfo>;
  currentFramework: FrontendFramework;
  totalPods: number;
  cpuUsedCores: number;
  ramUsedGb: number;
  isHpaScaled: boolean;
  onToggleHpa: () => void;
  onOpenManifests: () => void;
}

export const K8sMonitorView: React.FC<K8sMonitorViewProps> = ({
  microservices,
  pods,
  currentFramework,
  totalPods,
  cpuUsedCores,
  ramUsedGb,
  isHpaScaled,
  onToggleHpa,
  onOpenManifests,
}) => {
  const { language, t } = useAppSettings();
  const [selectedPodService, setSelectedPodService] = useState<string>('auth');
  const [liveLogs, setLiveLogs] = useState<PodInfo['logs']>(pods.auth.logs);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pods[selectedPodService]) {
      setLiveLogs(pods[selectedPodService].logs);
    }
  }, [selectedPodService, pods]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

      const newMessages =
        language === 'es'
          ? [
              `c.s.telemetry.Probe: HTTP GET /actuator/health/liveness devolvió 200 OK (0.8ms)`,
              `c.s.mesh.EnvoyFilter: Handshake mTLS Ingress completado para IP 10.244.1.84`,
              `c.s.reactive.MetricsCollector: 142 métricas enviadas al recolector Prometheus`,
              `c.s.security.JwtAuthenticationFilter: Sesión Bearer JWT validada para cliente activo`,
            ]
          : [
              `c.s.telemetry.Probe: HTTP GET /actuator/health/liveness returned 200 OK (0.8ms)`,
              `c.s.mesh.EnvoyFilter: Ingress mTLS handshake completed for IP 10.244.1.84`,
              `c.s.reactive.MetricsCollector: Flushed 142 metrics to Prometheus scraper`,
              `c.s.security.JwtAuthenticationFilter: Validated Bearer JWT session for active client`,
            ];
      const randomMsg = newMessages[Math.floor(Math.random() * newMessages.length)];

      setLiveLogs((prev) => [
        ...prev.slice(-14),
        {
          timestamp: timeStr,
          level: Math.random() > 0.8 ? 'DEBUG' : 'INFO',
          tag: selectedPodService + '-pod',
          message: randomMsg,
        },
      ]);
    }, 4000);

    return () => clearInterval(timer);
  }, [selectedPodService, language]);

  const activePod = pods[selectedPodService] || pods.auth;
  const cpuPct = Math.round((cpuUsedCores / 16) * 100);
  const ramPct = Math.round((ramUsedGb / 64) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Matte Architectural Hero Header (No AI glowing orbs or purple gradients) */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm dark:shadow-none">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider mb-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>{t.k8s.heroKicker}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
              {t.k8s.heroTitle}
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              {t.k8s.heroDesc}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={onOpenManifests}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileCode className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.k8s.viewManifestsBtn}</span>
            </button>
            <button
              onClick={onToggleHpa}
              className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                isHpaScaled
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-teal-700 hover:bg-teal-600 text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{isHpaScaled ? t.k8s.scaleDownBtn : t.k8s.scaleUpBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cascading Cluster Measurement Waterfall (Stepped Cascade Order: 01 -> 02 -> 03 -> 04) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
          <span>{language === 'es' ? 'Cascada de Medición del Clúster' : 'Cluster Measurement Cascade'}</span>
          <span>01 &rarr; 02 &rarr; 03 &rarr; 04</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Level 01: Cluster Health */}
          <div className="lg:ml-0 lg:mr-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">01</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t.k8s.clusterHealth}</span>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">· {t.k8s.healthy}</span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {t.k8s.nodesBreakdown} · {t.k8s.etcdQuorum} · {t.k8s.apiServer}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">{t.k8s.activeNodes}</div>
                <div className="text-[10px] text-teal-700 dark:text-teal-400">k8s v1.29.3</div>
              </div>
            </div>
          </div>

          {/* Level 02: CPU Allocation */}
          <div className="lg:ml-5 lg:mr-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">02</span>
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t.k8s.cpuAllocation}</span>
                  <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 tabular-nums">· {cpuPct}%</span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {t.k8s.requestsLabel} · {t.k8s.limitsLabel} · {t.k8s.throttling}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                <div
                  className="bg-teal-700 dark:bg-teal-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${cpuPct}%` }}
                ></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {cpuUsedCores} / 16 {t.k8s.coresLabel}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  {t.k8s.safeMargin}: {100 - cpuPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Level 03: RAM Memory Allocation */}
          <div className="lg:ml-10 lg:mr-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">03</span>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t.k8s.ramAllocation}</span>
                  <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 tabular-nums">· {ramPct}%</span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {t.k8s.workingSet} · {t.k8s.buffers} · {t.k8s.swapDisabled}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                <div
                  className="bg-amber-600 dark:bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${ramPct}%` }}
                ></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">{ramUsedGb} / 64 GB</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">{t.k8s.oomKills}</div>
              </div>
            </div>
          </div>

          {/* Level 04: Pods & Container Engine */}
          <div className="lg:ml-15 lg:mr-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-6">04</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t.k8s.podsAndDocker}</span>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">· {t.k8s.zeroRestarts}</span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {t.k8s.dockerRuntime} · {t.k8s.networkCni} · {t.k8s.crashLoop}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {totalPods} / {totalPods} {t.k8s.runningLabel}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center justify-end gap-1">
                  <Check className="w-3 h-3" /> {t.k8s.readyPct}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grid of Containerized Spring Boot Microservices */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Container className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.k8s.microservicesSectionTitle}</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{t.k8s.microservicesSectionSub}</p>
          </div>
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-emerald-700 dark:text-emerald-400 animate-spin" /> {t.k8s.pollingMetrics}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {microservices.map((svc) => {
            const isSelected = selectedPodService === svc.id;
            return (
              <div
                key={svc.id}
                className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 transition-colors shadow-sm dark:shadow-none ${
                  isSelected
                    ? 'border-teal-600 dark:border-teal-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-mono">{svc.name}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">· Docker Alpine</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                        · {svc.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{svc.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800 tabular-nums">
                      {isHpaScaled ? svc.podsCount + 2 : svc.podsCount} Pods
                    </span>
                  </div>
                </div>

                {/* Docker Spec Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-zinc-700 dark:text-zinc-300 gap-2">
                    <span className="text-zinc-500">{t.k8s.dockerImageLabel}</span>
                    <span className="text-zinc-800 dark:text-zinc-200 text-right">
                      {svc.dockerImage} ({svc.imageSize})
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-700 dark:text-zinc-300 gap-2">
                    <span className="text-zinc-500">{svc.frameworkSpec}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-right">{svc.techDetail}</span>
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">{t.k8s.cpuUsage}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {svc.cpuUsage}%
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">{t.k8s.ramAlloc}</span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                      {svc.ramAllocMb} MB
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">
                      {t.k8s.latencyP99}
                    </span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {svc.latencyP99Ms} ms
                    </span>
                  </div>
                </div>

                {/* Pod selector trigger */}
                <div className="mt-3 pt-1 flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500 font-mono">
                    {t.k8s.portLabel} {svc.port} / {svc.protocol}
                  </span>
                  <button
                    onClick={() => setSelectedPodService(svc.id)}
                    className="text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>{isSelected ? t.k8s.selectedInInspector : t.k8s.inspectPodBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Pod & Container Inspector */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                {t.k8s.podInspectorTitle}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{t.k8s.podInspectorSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-xs overflow-x-auto max-w-full">
            {microservices.map((svc) => {
              const pod = pods[svc.id];
              const isSelected = selectedPodService === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => setSelectedPodService(svc.id)}
                  className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {pod?.podName || svc.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1: Container Docker Specs */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              {t.k8s.dockerStateHeading}
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">{t.k8s.containerId}</span>
                <span className="text-zinc-800 dark:text-zinc-200 text-[11px] truncate max-w-[140px]">
                  {activePod.dockerId}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">{t.k8s.statusLabel}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{activePod.status}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">{t.k8s.restartCount}</span>
                <span className="text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {activePod.restarts} ({t.k8s.exitCode})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">{t.k8s.oomKilledLabel}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {activePod.oomKilled ? 'true' : t.k8s.noLabel}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">{t.k8s.serviceMeshLabel}</span>
                <span className="text-teal-700 dark:text-teal-400 text-right">{activePod.serviceMesh}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">{t.k8s.ingressRouteLabel}</span>
                <span className="text-zinc-800 dark:text-zinc-200 text-right">{activePod.ingressRoute}</span>
              </div>
            </div>

            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono pt-1">
              {t.k8s.k8sLimitsHeading}
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1 tabular-nums">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    CPU: {activePod.cpuReq} / {activePod.cpuLimit}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400">{activePod.cpuPct}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full" style={{ width: `${activePod.cpuPct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1 tabular-nums">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    RAM: {activePod.ramReq} / {activePod.ramLimit}
                  </span>
                  <span className="text-teal-700 dark:text-teal-400">{activePod.ramPct}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-700 dark:bg-teal-400 h-1.5 rounded-full" style={{ width: `${activePod.ramPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Live Simulated Container Logs */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between pb-2 text-xs gap-2 flex-wrap">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                {t.k8s.liveLogsTitle} (kubectl logs -f {activePod.podName})
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                <span>{t.k8s.streamingStdout}</span>
              </span>
            </div>

            <div className="flex-1 bg-zinc-900 dark:bg-zinc-950 rounded-lg border border-zinc-300 dark:border-zinc-800 p-3 font-mono text-xs overflow-y-auto max-h-64 custom-scrollbar text-zinc-300 space-y-1">
              {liveLogs.map((log, idx) => {
                let colorClass = 'text-zinc-300';
                if (log.level === 'DEBUG') colorClass = 'text-zinc-400';
                if (log.level === 'INFO' && log.message.includes('200 OK')) colorClass = 'text-emerald-400';
                if (log.level === 'INFO' && log.message.includes('Netty')) colorClass = 'text-teal-300';

                return (
                  <div key={idx} className={colorClass}>
                    <span className="text-zinc-500">[{log.timestamp}]</span>{' '}
                    <span className={log.level === 'DEBUG' ? 'text-amber-400 font-semibold' : 'text-teal-400 font-semibold'}>
                      {log.level}
                    </span>{' '}
                    <span className="text-zinc-500">[{log.tag}]</span>{' '}
                    <span>{log.message}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>

            <div className="mt-2 text-[10px] text-zinc-500 flex justify-between font-mono flex-wrap gap-2">
              <span>{t.k8s.logFilter}</span>
              <span>{t.k8s.logProbes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cascading Network Topology Diagram */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Network className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              {t.k8s.topologyTitle}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.k8s.topologySub}</p>
          </div>
          <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 self-start sm:self-auto">
            {t.k8s.topologyProto}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Layer 1: Client */}
          <div className="lg:ml-0 lg:mr-14 p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Monitor className="w-4 h-4 text-teal-700 dark:text-teal-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-400 uppercase">
                  {t.k8s.layers.l1Tag}
                </div>
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                  {t.k8s.layers.l1Title} ({currentFramework === 'react' ? 'React 18' : 'Angular 17'})
                </h5>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{t.k8s.layers.l1Desc}</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 flex sm:flex-col sm:items-end gap-2 sm:gap-0.5 shrink-0">
              <span>FCP: 0.64s</span>
              <span className="text-teal-700 dark:text-teal-400">JWT Bearer</span>
            </div>
          </div>

          {/* Layer 2: Gateway */}
          <div className="lg:ml-5 lg:mr-9 p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                  {t.k8s.layers.l2Tag}
                </div>
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t.k8s.layers.l2Title}</h5>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{t.k8s.layers.l2Desc}</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 flex sm:flex-col sm:items-end gap-2 sm:gap-0.5 shrink-0">
              <span>{t.k8s.layers.l2Port}</span>
              <span className="text-teal-700 dark:text-teal-400">TLS 1.3 mTLS</span>
            </div>
          </div>

          {/* Layer 3: Microservices */}
          <div className="lg:ml-10 lg:mr-5 p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Container className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  {t.k8s.layers.l3Tag}
                </div>
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t.k8s.layers.l3Title}</h5>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{t.k8s.layers.l3Desc}</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 flex sm:flex-col sm:items-end gap-2 sm:gap-0.5 shrink-0 tabular-nums">
              <span>Total: {totalPods} Pods</span>
              <span className="text-emerald-700 dark:text-emerald-400">Java 21 LTS</span>
            </div>
          </div>

          {/* Layer 4: Storage */}
          <div className="lg:ml-15 lg:mr-0 p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <HardDrive className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                  {t.k8s.layers.l4Tag}
                </div>
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t.k8s.layers.l4Title}</h5>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{t.k8s.layers.l4Desc}</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 flex sm:flex-col sm:items-end gap-2 sm:gap-0.5 shrink-0">
              <span>{t.k8s.layers.l4Pool}</span>
              <span className="text-amber-700 dark:text-amber-400">{t.k8s.layers.l4Acid}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
