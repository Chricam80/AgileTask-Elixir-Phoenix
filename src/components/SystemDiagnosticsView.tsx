import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Monitor,
  Play,
  Square,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  DownloadCloud,
  Wifi,
  Terminal,
} from 'lucide-react';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface OsDiagnostics {
  osName: string;
  platformArch: string;
  cpuCores: number;
  deviceMemoryGb: string;
  gpuRenderer: string;
  browserEngine: string;
  storageQuota: string;
  networkStatus: string;
  displaySpec: string;
  timezoneLocale: string;
  scannedAt: string;
}

interface SystemUpdateItem {
  id: string;
  nameEs: string;
  nameEn: string;
  categoryEs: string;
  categoryEn: string;
  currentVersion: string;
  targetVersion: string;
  size: string;
  notesEs: string;
  notesEn: string;
  status: 'installed' | 'pending' | 'critical' | 'installing';
}

const INITIAL_UPDATES: SystemUpdateItem[] = [
  {
    id: 'upd-os-kernel',
    nameEs: 'Parche de Seguridad del Kernel y Subsistema Base del SO',
    nameEn: 'OS Kernel & Base Subsystem Security Patch',
    categoryEs: 'Sistema Operativo',
    categoryEn: 'Operating System',
    currentVersion: '6.8.0-45',
    targetVersion: '6.8.0-49',
    size: '64.2 MB',
    notesEs: 'Mitigación CVE de aislamiento en espacios de nombres y mejora en planificador CFS.',
    notesEn: 'Namespace isolation CVE mitigation and CFS scheduler latency improvements.',
    status: 'critical',
  },
  {
    id: 'upd-docker',
    nameEs: 'Docker Engine & containerd Runtime',
    nameEn: 'Docker Engine & containerd Runtime',
    categoryEs: 'Contenedores',
    categoryEn: 'Containers',
    currentVersion: '26.0.0',
    targetVersion: '26.1.4',
    size: '112.8 MB',
    notesEs: 'Optimización en OverlayFS2 para capas Alpine Linux y menor consumo de memoria en daemon.',
    notesEn: 'OverlayFS2 optimization for Alpine Linux layers and lower daemon memory footprint.',
    status: 'pending',
  },
  {
    id: 'upd-openjdk',
    nameEs: 'Eclipse Temurin OpenJDK 21 LTS (JVM)',
    nameEn: 'Eclipse Temurin OpenJDK 21 LTS (JVM)',
    categoryEs: 'Runtime Backend',
    categoryEn: 'Backend Runtime',
    currentVersion: '21.0.3+9',
    targetVersion: '21.0.5+11',
    size: '98.5 MB',
    notesEs: 'Ajustes en recolector G1GC para contenedores con límites cgroups v2 y TLS 1.3.',
    notesEn: 'G1GC collector tuning for cgroups v2 container limits and TLS 1.3 cipher hardening.',
    status: 'pending',
  },
  {
    id: 'upd-k8s',
    nameEs: 'Kubernetes kubelet & Calico CNI Plugin',
    nameEn: 'Kubernetes kubelet & Calico CNI Plugin',
    categoryEs: 'Orquestación K8s',
    categoryEn: 'K8s Orchestration',
    currentVersion: '1.29.3',
    targetVersion: '1.29.6',
    size: '74.0 MB',
    notesEs: 'Corrección de estabilidad en sondas liveness/readiness y enrutamiento eBPF.',
    notesEn: 'Stability fix for liveness/readiness probes and eBPF dataplane routing.',
    status: 'critical',
  },
  {
    id: 'upd-spring',
    nameEs: 'Spring Boot 3.2.4 & Spring Security 6.2',
    nameEn: 'Spring Boot 3.2.4 & Spring Security 6.2',
    categoryEs: 'Framework API',
    categoryEn: 'API Framework',
    currentVersion: '3.2.4',
    targetVersion: '3.2.4',
    size: '28.4 MB',
    notesEs: 'Soporte nativo de Virtual Threads (Project Loom) y filtros JWT verificados.',
    notesEn: 'Native Virtual Threads (Project Loom) support and verified JWT filter chain.',
    status: 'installed',
  },
  {
    id: 'upd-firmware',
    nameEs: 'Controladores de Red y Microcódigo del Equipo',
    nameEn: 'Network Drivers & System Microcode',
    categoryEs: 'Hardware / Firmware',
    categoryEn: 'Hardware / Firmware',
    currentVersion: '2.14.0',
    targetVersion: '2.14.0',
    size: '19.6 MB',
    notesEs: 'Gestión energética estable bajo cargas sostenidas de compilación.',
    notesEn: 'Stable power management profile under sustained compilation workloads.',
    status: 'installed',
  },
];

function detectOsInfo(language: 'es' | 'en', notExposedText: string, onlineText: string, offlineText: string): Omit<OsDiagnostics, 'storageQuota'> {
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown';
  let osName = platform;

  if (/Windows NT 10\.0/i.test(ua)) osName = 'Windows 10 / 11 (NT 10.0)';
  else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    osName = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/Linux/i.test(ua)) osName = 'Linux (x86_64 / POSIX)';
  else if (/CrOS/i.test(ua)) osName = 'ChromeOS';
  else if (/Android/i.test(ua)) osName = 'Android';

  let browserEngine = 'WebKit / Blink';
  if (/Edg\//i.test(ua)) browserEngine = 'Microsoft Edge (Chromium / V8)';
  else if (/Chrome\//i.test(ua)) {
    const ver = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    browserEngine = `Chromium ${ver} (V8 Engine)`;
  } else if (/Firefox\//i.test(ua)) {
    const ver = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    browserEngine = `Firefox ${ver} (SpiderMonkey)`;
  } else if (/Safari\//i.test(ua)) {
    browserEngine = 'Safari (JavaScriptCore)';
  }

  let gpuRenderer = notExposedText;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer) gpuRenderer = String(renderer);
      } else {
        gpuRenderer = String(webgl.getParameter(webgl.RENDERER) || 'WebGL 1.0');
      }
    }
  } catch {
    gpuRenderer = notExposedText;
  }

  const cores = navigator.hardwareConcurrency || 4;
  const devMem = (navigator as any).deviceMemory;
  const deviceMemoryGb = devMem ? `${devMem} GB (Web API)` : notExposedText;

  const conn = (navigator as any).connection;
  const connStatus = navigator.onLine ? onlineText : offlineText;
  const networkStatus = conn
    ? `${connStatus} · ${String(conn.effectiveType || '4g').toUpperCase()} · ${conn.downlink ?? '—'} Mbps (${conn.rtt ?? '—'} ms RTT)`
    : connStatus;

  const dpr = window.devicePixelRatio || 1;
  const displaySpec = `${window.screen.width}×${window.screen.height} px · ${dpr}x DPR · ${window.screen.colorDepth}-bit`;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const timezoneLocale = `${tz} · ${navigator.language || language}`;

  return {
    osName,
    platformArch: platform,
    cpuCores: cores,
    deviceMemoryGb,
    gpuRenderer,
    browserEngine,
    networkStatus,
    displaySpec,
    timezoneLocale,
    scannedAt: new Date().toLocaleTimeString(),
  };
}

export const SystemDiagnosticsView: React.FC = () => {
  const { language, t } = useAppSettings();

  // OS Inspection state
  const [osInfo, setOsInfo] = useState<OsDiagnostics>(() => ({
    ...detectOsInfo(language, t.diagnostics.notExposed, t.diagnostics.onlineText, t.diagnostics.offlineText),
    storageQuota: '—',
  }));

  const scanSystem = useCallback(async () => {
    const base = detectOsInfo(language, t.diagnostics.notExposed, t.diagnostics.onlineText, t.diagnostics.offlineText);
    let storageQuota = t.diagnostics.notExposed;
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usedMb = ((est.usage || 0) / (1024 * 1024)).toFixed(1);
        const quotaGb = ((est.quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
        storageQuota = `${usedMb} MB / ${quotaGb} GB`;
      }
    } catch {
      storageQuota = t.diagnostics.notExposed;
    }
    setOsInfo({ ...base, storageQuota });
  }, [language, t.diagnostics.notExposed, t.diagnostics.offlineText, t.diagnostics.onlineText]);

  useEffect(() => {
    scanSystem();
  }, [scanSystem]);

  // Stress Test state
  const [durationSec, setDurationSec] = useState<5 | 10 | 15>(10);
  const [workloadMode, setWorkloadMode] = useState<'cpu' | 'memory' | 'mixed'>('mixed');
  const [isStressRunning, setIsStressRunning] = useState(false);
  const [stressCompleted, setStressCompleted] = useState(false);
  const [stressProgress, setStressProgress] = useState(0);
  const [stressMetrics, setStressMetrics] = useState({
    opsPerSec: 0,
    p95LatencyMs: 0,
    fps: 60,
    stabilityPct: 100,
    memAllocMb: 0,
  });

  const animFrameRef = useRef<number | null>(null);
  const stopFlagRef = useRef<boolean>(false);

  const stopStressTest = useCallback(() => {
    stopFlagRef.current = true;
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsStressRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopFlagRef.current = true;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const startStressTest = () => {
    stopFlagRef.current = false;
    setIsStressRunning(true);
    setStressCompleted(false);
    setStressProgress(0);

    const startTime = performance.now();
    const durationMs = durationSec * 1000;
    let totalOps = 0;
    let frameCount = 0;
    let lastFpsTime = startTime;
    let currentFps = 60;
    const frameTimes: number[] = [];
    const memoryBuffers: Float64Array[] = [];

    const step = (now: number) => {
      if (stopFlagRef.current) return;

      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setStressProgress(pct);

      const batchStart = performance.now();
      let batchOps = 0;

      // Controlled CPU work (~10ms chunk per frame so UI stays responsive and measurable)
      if (workloadMode === 'cpu' || workloadMode === 'mixed') {
        const chunkBudgetMs = workloadMode === 'cpu' ? 14 : 9;
        while (performance.now() - batchStart < chunkBudgetMs) {
          let primes = 0;
          for (let n = 2; n < 900; n++) {
            let isPrime = true;
            for (let d = 2; d * d <= n; d++) {
              if (n % d === 0) {
                isPrime = false;
                break;
              }
            }
            if (isPrime) primes++;
          }
          batchOps += primes;
        }
      }

      // Controlled memory allocation work
      if (workloadMode === 'memory' || workloadMode === 'mixed') {
        if (memoryBuffers.length < 48) {
          const arr = new Float64Array(65536); // 512 KB chunk
          for (let i = 0; i < arr.length; i += 64) {
            arr[i] = Math.sqrt(i + batchOps);
          }
          memoryBuffers.push(arr);
          batchOps += 1024;
        } else {
          // Rotate buffer to stress GC & cache locality
          memoryBuffers.shift();
          const arr = new Float64Array(65536);
          arr[0] = now;
          memoryBuffers.push(arr);
          batchOps += 1024;
        }
      }

      const batchDuration = performance.now() - batchStart;
      frameTimes.push(batchDuration);
      if (frameTimes.length > 60) frameTimes.shift();

      totalOps += batchOps;
      frameCount++;

      if (now - lastFpsTime >= 350) {
        currentFps = Math.min(60, Math.max(12, Math.round((frameCount * 1000) / (now - lastFpsTime))));
        frameCount = 0;
        lastFpsTime = now;

        const sorted = [...frameTimes].sort((a, b) => a - b);
        const p95 = sorted[Math.floor(sorted.length * 0.95)] || batchDuration;
        const opsSec = Math.round((totalOps / Math.max(1, elapsed)) * 1000);
        const stability = Math.max(72, Math.min(100, Math.round(100 - Math.max(0, p95 - 12) * 1.4)));
        const heapUsed = (performance as any).memory?.usedJSHeapSize
          ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
          : Math.round((memoryBuffers.length * 512) / 1024);

        setStressMetrics({
          opsPerSec: opsSec,
          p95LatencyMs: Number(p95.toFixed(1)),
          fps: currentFps,
          stabilityPct: stability,
          memAllocMb: heapUsed,
        });
      }

      if (elapsed < durationMs) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setStressProgress(100);
        setIsStressRunning(false);
        setStressCompleted(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // System Updates state
  const [updates, setUpdates] = useState<SystemUpdateItem[]>(INITIAL_UPDATES);
  const [updateFilter, setUpdateFilter] = useState<'all' | 'pending' | 'critical' | 'installed'>('all');
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const pendingCount = updates.filter((u) => u.status === 'pending' || u.status === 'critical').length;

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
    }, 900);
  };

  const handleInstallUpdate = (id: string) => {
    setUpdates((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'installing' } : u)));
    setTimeout(() => {
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 'installed', currentVersion: u.targetVersion } : u
        )
      );
    }, 850);
  };

  const handleInstallAll = () => {
    const targets = updates.filter((u) => u.status === 'pending' || u.status === 'critical').map((u) => u.id);
    if (targets.length === 0) return;

    setUpdates((prev) =>
      prev.map((u) => (targets.includes(u.id) ? { ...u, status: 'installing' } : u))
    );
    setTimeout(() => {
      setUpdates((prev) =>
        prev.map((u) =>
          targets.includes(u.id) ? { ...u, status: 'installed', currentVersion: u.targetVersion } : u
        )
      );
    }, 1200);
  };

  const filteredUpdates = updates.filter((u) => {
    if (updateFilter === 'all') return true;
    if (updateFilter === 'pending') return u.status === 'pending' || u.status === 'critical';
    return u.status === updateFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Architectural Summary Banner */}
      <div className="bg-white dark:bg-[#141619] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-xs font-mono text-blue-700 dark:text-blue-400 font-semibold mb-1.5">
              {t.diagnostics.bannerKicker}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t.diagnostics.bannerTitle}
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {t.diagnostics.bannerDesc}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <button
              onClick={scanSystem}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.diagnostics.rescanBtn}</span>
            </button>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              {t.diagnostics.lastScan} {osInfo.scannedAt}
            </span>
          </div>
        </div>
      </div>

      {/* CASCADE STEP 01: HARDWARE STRESS TEST */}
      <section className="bg-white dark:bg-[#141619] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              {t.diagnostics.step01Tag}
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>{t.diagnostics.step01Title}</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{t.diagnostics.step01Desc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.intensityLabel}</span>
              <select
                value={durationSec}
                disabled={isStressRunning}
                onChange={(e) => setDurationSec(Number(e.target.value) as 5 | 10 | 15)}
                className="bg-zinc-50 dark:bg-[#0F1114] border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-600"
              >
                <option value={5}>{t.diagnostics.intensityLight}</option>
                <option value={10}>{t.diagnostics.intensityModerate}</option>
                <option value={15}>{t.diagnostics.intensityHeavy}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.workloadLabel}</span>
              <select
                value={workloadMode}
                disabled={isStressRunning}
                onChange={(e) => setWorkloadMode(e.target.value as 'cpu' | 'memory' | 'mixed')}
                className="bg-zinc-50 dark:bg-[#0F1114] border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-600"
              >
                <option value="mixed">{t.diagnostics.workloadMixed}</option>
                <option value="cpu">{t.diagnostics.workloadCpu}</option>
                <option value="memory">{t.diagnostics.workloadMem}</option>
              </select>
            </div>

            {!isStressRunning ? (
              <button
                onClick={startStressTest}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.diagnostics.startStressBtn}</span>
              </button>
            ) : (
              <button
                onClick={stopStressTest}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.diagnostics.stopStressBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono tabular-nums">
            <span className="text-zinc-600 dark:text-zinc-400">
              {isStressRunning
                ? t.diagnostics.runningStatus
                : stressCompleted
                ? t.diagnostics.completedStatus
                : t.diagnostics.idleStatus}
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t.diagnostics.progressLabel}: {stressProgress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                isStressRunning
                  ? 'bg-blue-700 dark:bg-blue-500'
                  : stressCompleted
                  ? 'bg-emerald-700 dark:bg-emerald-500'
                  : 'bg-zinc-400 dark:bg-zinc-600'
              }`}
              style={{ width: `${stressProgress}%` }}
            />
          </div>
        </div>

        {/* Stepped Measurement Cascade for Stress Metrics */}
        <div className="space-y-2.5">
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0F1114] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-zinc-400">1.1</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.diagnostics.metricOps}</span>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {stressMetrics.opsPerSec.toLocaleString()} ops/s
            </span>
          </div>

          <div className="md:ml-4 p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0F1114] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-zinc-400">1.2</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.diagnostics.metricLatency}</span>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {stressMetrics.p95LatencyMs} ms
            </span>
          </div>

          <div className="md:ml-8 p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0F1114] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-zinc-400">1.3</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.diagnostics.metricFps}</span>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {stressMetrics.fps} FPS
            </span>
          </div>

          <div className="md:ml-12 p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0F1114] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-zinc-400">1.4</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.diagnostics.metricMemAlloc}</span>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {stressMetrics.memAllocMb} MB
            </span>
          </div>

          <div className="md:ml-16 p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0F1114] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-zinc-400">1.5</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.diagnostics.metricStability}</span>
            </div>
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                stressMetrics.stabilityPct >= 88
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {stressMetrics.stabilityPct}%
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            {!stressCompleted
              ? t.diagnostics.verdictReady
              : stressMetrics.stabilityPct >= 88
              ? t.diagnostics.verdictOptimal
              : t.diagnostics.verdictModerate}
          </span>
        </div>
      </section>

      {/* CASCADE STEP 02: OPERATING SYSTEM & HARDWARE ANALYSIS */}
      <section className="md:ml-4 bg-white dark:bg-[#141619] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            {t.diagnostics.step02Tag}
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>{t.diagnostics.step02Title}</span>
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{t.diagnostics.step02Desc}</p>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" /> {t.diagnostics.osLabel}
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{osInfo.osName}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> {t.diagnostics.archLabel}
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{osInfo.platformArch}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.cpuCoresLabel}</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {osInfo.cpuCores} threads
            </span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.ramDeviceLabel}</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {osInfo.deviceMemoryGb}
            </span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.gpuLabel}</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate max-w-md">{osInfo.gpuRenderer}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.browserEngineLabel}</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{osInfo.browserEngine}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" /> {t.diagnostics.storageLabel}
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {osInfo.storageQuota}
            </span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" /> {t.diagnostics.networkLabel}
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{osInfo.networkStatus}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.displayLabel}</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200 tabular-nums">{osInfo.displaySpec}</span>
          </div>

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.timezoneLabel}</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{osInfo.timezoneLocale}</span>
          </div>
        </div>
      </section>

      {/* CASCADE STEP 03: SYSTEM & STACK UPDATES */}
      <section className="md:ml-8 bg-white dark:bg-[#141619] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              {t.diagnostics.step03Tag}
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>{t.diagnostics.step03Title}</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{t.diagnostics.step03Desc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdates ? t.diagnostics.checkingBtn : t.diagnostics.checkUpdatesBtn}</span>
            </button>

            {pendingCount > 0 && (
              <button
                onClick={handleInstallAll}
                className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>
                  {t.diagnostics.installAllBtn} ({pendingCount})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar + Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-[#0F1114] border border-zinc-200 dark:border-zinc-800 rounded-lg self-start">
            {(['all', 'pending', 'critical', 'installed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setUpdateFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  updateFilter === f
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {f === 'all'
                  ? t.diagnostics.filterAll
                  : f === 'pending'
                  ? t.diagnostics.filterPending
                  : f === 'critical'
                  ? t.diagnostics.filterCritical
                  : t.diagnostics.filterInstalled}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 tabular-nums">
            {pendingCount > 0 ? `${pendingCount} ${t.diagnostics.updatesSummary}` : t.diagnostics.allUpdated}
          </div>
        </div>

        {/* Updates List */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          {filteredUpdates.map((upd) => {
            const name = language === 'es' ? upd.nameEs : upd.nameEn;
            const category = language === 'es' ? upd.categoryEs : upd.categoryEn;
            const notes = language === 'es' ? upd.notesEs : upd.notesEn;

            return (
              <div
                key={upd.id}
                className="p-4 bg-zinc-50/50 dark:bg-[#0F1114] flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{name}</span>
                    {upd.status === 'critical' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-red-700 dark:text-red-400">
                        <ShieldAlert className="w-3.5 h-3.5" /> {t.diagnostics.statusCritical}
                      </span>
                    )}
                    {upd.status === 'pending' && (
                      <span className="text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-400">
                        · {t.diagnostics.statusPending}
                      </span>
                    )}
                    {upd.status === 'installed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.diagnostics.statusInstalled}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{notes}</p>
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2 flex-wrap tabular-nums">
                    <span>
                      {t.diagnostics.categoryLabel} {category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {t.diagnostics.versionChange} {upd.currentVersion}
                      {upd.currentVersion !== upd.targetVersion ? ` → ${upd.targetVersion}` : ''}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{upd.size}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {upd.status === 'installed' ? (
                    <span className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-mono inline-block">
                      {t.diagnostics.installedAction}
                    </span>
                  ) : upd.status === 'installing' ? (
                    <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-mono inline-flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      {t.diagnostics.statusInstalling}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInstallUpdate(upd.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                    >
                      {t.diagnostics.installAction}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
