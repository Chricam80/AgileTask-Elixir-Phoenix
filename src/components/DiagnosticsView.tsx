import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Flame,
  Play,
  Square,
  Cpu,
  HardDrive,
  Monitor,
  Server,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Thermometer,
  Clock,
  Terminal,
} from 'lucide-react';
import { SystemUpdateItem } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';

type StressProfile = 'cpu' | 'memory' | 'io' | 'full';
type StressIntensity = 'low' | 'medium' | 'extreme';

interface StressSample {
  t: number;
  load: number;
  temp: number;
}

const INITIAL_UPDATES: SystemUpdateItem[] = [
  {
    id: 'upd-kernel',
    packageName: 'linux-image-6.8.0-49-generic',
    category: 'kernel',
    severity: 'critical',
    currentVersion: '6.8.0-45',
    targetVersion: '6.8.0-49',
    sizeMb: 118,
    status: 'pending',
    summaryEs: 'Corrección de vulnerabilidad CVE en subsistema eBPF, netfilter y aislamiento de cgroups v2.',
    summaryEn: 'CVE security fix for eBPF subsystem, netfilter, and cgroups v2 isolation.',
  },
  {
    id: 'upd-openssl',
    packageName: 'openssl-libs & ca-certificates',
    category: 'security',
    severity: 'security',
    currentVersion: '3.0.13-0ubuntu3',
    targetVersion: '3.0.15-0ubuntu1',
    sizeMb: 14,
    status: 'pending',
    summaryEs: 'Parche TLS 1.3 para validación estricta de cadenas X.509 en malla mTLS Istio.',
    summaryEn: 'TLS 1.3 patch for strict X.509 chain validation in Istio mTLS mesh.',
  },
  {
    id: 'upd-docker',
    packageName: 'docker-ce & containerd.io',
    category: 'container',
    severity: 'security',
    currentVersion: '26.0.1 / 1.6.31',
    targetVersion: '26.1.4 / 1.7.18',
    sizeMb: 94,
    status: 'pending',
    summaryEs: 'Actualización de runtime de contenedores con mejoras de overlayfs y límites OCI.',
    summaryEn: 'Container runtime update with overlayfs improvements and OCI limit enforcement.',
  },
  {
    id: 'upd-jdk',
    packageName: 'temurin-21-jdk (OpenJDK LTS)',
    category: 'runtime',
    severity: 'maintenance',
    currentVersion: '21.0.4+7',
    targetVersion: '21.0.5+11',
    sizeMb: 186,
    status: 'pending',
    summaryEs: 'Optimizaciones de recolector G1GC y reducción de pausas en microservicios Spring Boot 3.2.',
    summaryEn: 'G1GC collector optimizations and reduced pause times for Spring Boot 3.2 microservices.',
  },
  {
    id: 'upd-kubelet',
    packageName: 'kubelet & kubectl (Kubernetes)',
    category: 'container',
    severity: 'maintenance',
    currentVersion: 'v1.29.3',
    targetVersion: 'v1.29.8',
    sizeMb: 62,
    status: 'installed',
    summaryEs: 'Estabilización de sondas liveness/readiness y métricas cAdvisor en nodos worker.',
    summaryEn: 'Liveness/readiness probe stabilization and cAdvisor metric fixes on worker nodes.',
  },
  {
    id: 'upd-microcode',
    packageName: 'amd64-microcode / intel-microcode',
    category: 'firmware',
    severity: 'security',
    currentVersion: '20240514',
    targetVersion: '20240910',
    sizeMb: 8,
    status: 'installed',
    summaryEs: 'Mitigación a nivel de microcódigo para ejecución especulativa y estabilidad de caché L3.',
    summaryEn: 'Microcode-level mitigation for speculative execution and L3 cache stability.',
  },
];

function detectClientEnvironment(lang: 'es' | 'en') {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let osName = lang === 'es' ? 'Sistema Desconocido' : 'Unknown OS';
  if (ua.includes('Windows NT 10.0')) osName = 'Windows 10 / 11 (x64)';
  else if (ua.includes('Windows')) osName = 'Windows NT';
  else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    osName = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (ua.includes('Ubuntu')) osName = 'Ubuntu Linux';
  else if (ua.includes('Linux')) osName = 'Linux (x86_64 / ARM64)';
  else if (ua.includes('Android')) osName = 'Android OS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS / iPadOS';

  let browserName = 'Chromium / WebKit';
  if (ua.includes('Edg/')) browserName = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browserName = 'Google Chrome';
  else if (ua.includes('Firefox/')) browserName = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browserName = 'Apple Safari';

  const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 8;
  const deviceMemory =
    typeof navigator !== 'undefined' && (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB (API)` : '16 GB (Est.)';

  let gpuRenderer = lang === 'es' ? 'Aceleración Hardware WebGL2' : 'WebGL2 Hardware Acceleration';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
        if (renderer) gpuRenderer = String(renderer);
      }
    }
  } catch {
    // fallback silently
  }

  const screenRes =
    typeof window !== 'undefined'
      ? `${window.screen.width}×${window.screen.height} @ ${window.devicePixelRatio || 1}x`
      : '1920×1080 @ 1x';

  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
  const netInfo = conn?.effectiveType
    ? `${String(conn.effectiveType).toUpperCase()} · ${conn.downlink || 10} Mbps`
    : lang === 'es'
    ? 'En línea · TLS 1.3 Activo'
    : 'Online · TLS 1.3 Active';

  return {
    osName: `${osName} (${browserName})`,
    cores,
    deviceMemory,
    gpuRenderer,
    screenRes,
    netInfo,
  };
}

export const DiagnosticsView: React.FC = () => {
  const { language, t } = useAppSettings();

  // Stress Test State
  const [profile, setProfile] = useState<StressProfile>('cpu');
  const [intensity, setIntensity] = useState<StressIntensity>('medium');
  const [durationSec, setDurationSec] = useState<number>(15);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState<boolean>(false);
  const [remainingSec, setRemainingSec] = useState<number>(15);

  const [cpuLoad, setCpuLoad] = useState<number>(14);
  const [ramPressure, setRamPressure] = useState<number>(42);
  const [temperature, setTemperature] = useState<number>(44);
  const [clockGhz, setClockGhz] = useState<number>(2.4);
  const [opsPerSec, setOpsPerSec] = useState<number>(0);
  const [loopLatencyMs, setLoopLatencyMs] = useState<number>(1.2);
  const [samples, setSamples] = useState<StressSample[]>([
    { t: 0, load: 14, temp: 44 },
    { t: 1, load: 16, temp: 44 },
    { t: 2, load: 13, temp: 43 },
    { t: 3, load: 15, temp: 44 },
  ]);

  // OS Analysis State
  const [isScanningOs, setIsScanningOs] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>(() => new Date().toLocaleTimeString());
  const clientEnv = useMemo(() => detectClientEnvironment(language), [language, lastScanTime]);

  // Updates State
  const [updates, setUpdates] = useState<SystemUpdateItem[]>(INITIAL_UPDATES);
  const [updateFilter, setUpdateFilter] = useState<'all' | 'pending' | 'security' | 'installed'>('all');
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<string>(() => new Date().toLocaleTimeString());

  const stressBufferRef = useRef<Uint8Array | null>(null);
  const sampleCounterRef = useRef<number>(4);

  // Clean up any temporary memory buffer on unmount or stop
  useEffect(() => {
    return () => {
      stressBufferRef.current = null;
    };
  }, []);

  // Stress test execution loop (safe chunked real compute/memory + telemetry)
  useEffect(() => {
    if (!isRunning) {
      stressBufferRef.current = null;
      return;
    }

    const intensityFactor = intensity === 'low' ? 0.35 : intensity === 'medium' ? 0.68 : 0.94;
    const workIterations = intensity === 'low' ? 18000 : intensity === 'medium' ? 55000 : 120000;

    if (profile === 'memory' || profile === 'full') {
      const mbSize = intensity === 'low' ? 8 : intensity === 'medium' ? 24 : 48;
      stressBufferRef.current = new Uint8Array(mbSize * 1024 * 1024);
    } else {
      stressBufferRef.current = null;
    }

    const tickTimer = setInterval(() => {
      const start = performance.now();
      let ops = 0;

      // Controlled CPU prime / trig math workload
      if (profile === 'cpu' || profile === 'full') {
        let acc = 0;
        for (let i = 1; i <= workIterations; i++) {
          acc += Math.sqrt(i * 1.6180339) % 7;
        }
        ops = Math.round(workIterations * (14 + Math.random() * 4)) + (acc > 0 ? 1 : 0);
      }

      // Controlled Memory read/write bandwidth pass
      if ((profile === 'memory' || profile === 'full') && stressBufferRef.current) {
        const buf = stressBufferRef.current;
        const step = 4096;
        let checksum = 0;
        for (let i = 0; i < buf.length; i += step) {
          buf[i] = (i & 255) ^ 0x5a;
          checksum += buf[i];
        }
        ops += Math.round((buf.length / step) * 420) + (checksum > 0 ? 1 : 0);
      }

      // Storage / IO timing pass
      if (profile === 'io') {
        try {
          const payload = 'DevAgile-StressIO-'.repeat(256);
          sessionStorage.setItem('__devagile_io_bench', payload);
          const readBack = sessionStorage.getItem('__devagile_io_bench') || '';
          sessionStorage.removeItem('__devagile_io_bench');
          ops = Math.round(readBack.length * (intensity === 'extreme' ? 18 : 10));
        } catch {
          ops = 48000;
        }
      }

      const elapsed = Math.max(0.4, performance.now() - start);

      const targetLoad = Math.min(99, Math.round(intensityFactor * 100 - 4 + Math.random() * 8));
      const targetRam =
        profile === 'memory' || profile === 'full'
          ? Math.min(92, Math.round(48 + intensityFactor * 42 + Math.random() * 4))
          : Math.min(72, Math.round(44 + intensityFactor * 18 + Math.random() * 4));

      setCpuLoad(targetLoad);
      setRamPressure(targetRam);
      setClockGhz(Number((2.8 + intensityFactor * 1.85 + (Math.random() - 0.5) * 0.12).toFixed(2)));
      setOpsPerSec(ops);
      setLoopLatencyMs(Number(elapsed.toFixed(2)));

      setTemperature((prevTemp) => {
        const targetTemp = 45 + intensityFactor * 41;
        const nextTemp = prevTemp + (targetTemp - prevTemp) * 0.35 + (Math.random() - 0.5) * 1.2;
        const rounded = Math.round(Math.min(93, Math.max(40, nextTemp)));

        sampleCounterRef.current += 1;
        setSamples((prev) => [...prev.slice(-29), { t: sampleCounterRef.current, load: targetLoad, temp: rounded }]);
        return rounded;
      });

      setRemainingSec((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompletedOnce(true);
          stressBufferRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(tickTimer);
    };
  }, [isRunning, profile, intensity]);

  // Cooldown when idle
  useEffect(() => {
    if (isRunning) return;
    const cooldown = setInterval(() => {
      setCpuLoad((prev) => (prev > 16 ? Math.max(14, prev - 9) : prev));
      setRamPressure((prev) => (prev > 44 ? Math.max(42, prev - 5) : prev));
      setTemperature((prev) => (prev > 45 ? Math.max(44, prev - 3) : prev));
      setClockGhz((prev) => (prev > 2.5 ? Number(Math.max(2.4, prev - 0.3).toFixed(2)) : prev));
    }, 1000);
    return () => clearInterval(cooldown);
  }, [isRunning]);

  const handleToggleStress = () => {
    if (isRunning) {
      setIsRunning(false);
      stressBufferRef.current = null;
    } else {
      setRemainingSec(durationSec);
      setHasCompletedOnce(false);
      setIsRunning(true);
    }
  };

  const handleDeepScan = () => {
    setIsScanningOs(true);
    setTimeout(() => {
      setLastScanTime(new Date().toLocaleTimeString());
      setIsScanningOs(false);
    }, 850);
  };

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setLastUpdateCheck(new Date().toLocaleTimeString());
      setIsCheckingUpdates(false);
    }, 900);
  };

  const handleInstallOne = (id: string) => {
    setUpdates((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'installing' } : u)));
    setTimeout(() => {
      setUpdates((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'installed' } : u)));
    }, 1100);
  };

  const handleInstallAllPending = () => {
    const pendingIds = updates.filter((u) => u.status === 'pending').map((u) => u.id);
    if (pendingIds.length === 0) return;
    setUpdates((prev) => prev.map((u) => (u.status === 'pending' ? { ...u, status: 'installing' } : u)));
    setTimeout(() => {
      setUpdates((prev) => prev.map((u) => (u.status === 'installing' ? { ...u, status: 'installed' } : u)));
    }, 1500);
  };

  const pendingCount = updates.filter((u) => u.status === 'pending' || u.status === 'installing').length;
  const securityPendingCount = updates.filter(
    (u) => (u.status === 'pending' || u.status === 'installing') && (u.severity === 'critical' || u.severity === 'security')
  ).length;
  const installedCount = updates.filter((u) => u.status === 'installed').length;

  const filteredUpdates = updates.filter((u) => {
    if (updateFilter === 'pending') return u.status === 'pending' || u.status === 'installing';
    if (updateFilter === 'security') return u.severity === 'critical' || u.severity === 'security';
    if (updateFilter === 'installed') return u.status === 'installed';
    return true;
  });

  const thermalStatus =
    temperature >= 80
      ? { label: t.diagnostics.thermalHot, cls: 'text-red-700 dark:text-red-400' }
      : temperature >= 65
      ? { label: t.diagnostics.thermalElevated, cls: 'text-amber-700 dark:text-amber-400' }
      : { label: t.diagnostics.thermalNominal, cls: 'text-emerald-700 dark:text-emerald-400' };

  // Build Stress SVG paths
  const chartW = 540;
  const chartH = 140;
  const padX = 28;
  const padY = 16;
  const maxSamples = Math.max(2, samples.length);

  const loadPoints = samples
    .map((s, idx) => {
      const x = padX + (idx * (chartW - padX * 2)) / (maxSamples - 1);
      const y = chartH - padY - (s.load / 100) * (chartH - padY * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const tempPoints = samples
    .map((s, idx) => {
      const x = padX + (idx * (chartW - padX * 2)) / (maxSamples - 1);
      const y = chartH - padY - ((s.temp - 30) / 70) * (chartH - padY * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const partitions = [
    { mount: '/', device: '/dev/nvme0n1p2 (ext4)', usedGb: 42.6, totalGb: 120 },
    { mount: '/var/lib/docker', device: '/dev/nvme0n1p3 (overlay2)', usedGb: 68.4, totalGb: 160 },
    { mount: '/var/log', device: '/dev/nvme1n1p1 (xfs)', usedGb: 9.2, totalGb: 40 },
    { mount: '/mnt/pgdata', device: '/dev/nvme1n1p2 (ext4)', usedGb: 31.8, totalGb: 100 },
  ];

  const osChecks = [
    {
      nameEs: 'Integridad de Kernel y Módulos eBPF',
      nameEn: 'Kernel Integrity & eBPF Modules',
      detailEs: 'Firmas verificadas · Sin errores dmesg críticos',
      detailEn: 'Verified signatures · Zero critical dmesg errors',
      ok: true,
    },
    {
      nameEs: 'Aislamiento de Cgroups v2 y Namespaces',
      nameEn: 'Cgroups v2 & Namespace Isolation',
      detailEs: 'Límites de CPU/RAM activos para contenedores Docker',
      detailEn: 'CPU/RAM limits enforced for Docker containers',
      ok: true,
    },
    {
      nameEs: 'Política de Seguridad AppArmor / SELinux',
      nameEn: 'AppArmor / SELinux Security Policy',
      detailEs: 'Modo Enforcing · 28 perfiles cargados',
      detailEn: 'Enforcing mode · 28 profiles loaded',
      ok: true,
    },
    {
      nameEs: 'Estado de Parches del Sistema',
      nameEn: 'System Patch Compliance',
      detailEs:
        pendingCount > 0
          ? `${pendingCount} actualizaciones pendientes de aplicar`
          : 'Todos los paquetes críticos actualizados',
      detailEn:
        pendingCount > 0 ? `${pendingCount} pending updates to apply` : 'All critical packages up to date',
      ok: pendingCount === 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Grounded Hero Header */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm dark:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 mb-1.5">
              {t.diagnostics.heroKicker}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
              {t.diagnostics.heroTitle}
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              {t.diagnostics.heroDesc}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleStress}
              className={`px-4 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                isRunning
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-teal-700 hover:bg-teal-600 text-white'
              }`}
            >
              {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? t.diagnostics.stopStressBtn : t.diagnostics.startStressBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cascading Measurement Waterfall (01 -> 02 -> 03 -> 04) */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            {t.diagnostics.cascadeHeading}
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.diagnostics.cascadeSub}</span>
        </div>

        {/* Step 01: Compute & Thermal */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums shrink-0">01</span>
            <Cpu className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.diagnostics.cascade01Label}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {clientEnv.cores} {t.sidebar.coresUnit} · {clockGhz} GHz · {temperature}°C
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:w-80">
            <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  cpuLoad > 80 ? 'bg-red-600' : cpuLoad > 55 ? 'bg-amber-600' : 'bg-teal-600'
                }`}
                style={{ width: `${cpuLoad}%` }}
              ></div>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums w-14 text-right">
              {cpuLoad}%
            </span>
          </div>
        </div>

        {/* Step 02: Memory Pressure (Cascaded) */}
        <div className="lg:ml-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums shrink-0">02</span>
            <HardDrive className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.diagnostics.cascade02Label}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {clientEnv.deviceMemory} · Event Loop {loopLatencyMs} ms
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:w-80">
            <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-700 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${ramPressure}%` }}
              ></div>
            </div>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums w-14 text-right">
              {ramPressure}%
            </span>
          </div>
        </div>

        {/* Step 03: OS & Kernel (Cascaded) */}
        <div className="lg:ml-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums shrink-0">03</span>
            <Monitor className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.diagnostics.cascade03Label}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-md">
                {clientEnv.osName} · Host Linux 6.8.0-45-generic
              </div>
            </div>
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
            AppArmor Enforcing · OK
          </div>
        </div>

        {/* Step 04: Updates & Patches (Cascaded) */}
        <div className="lg:ml-15 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums shrink-0">04</span>
            <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.diagnostics.cascade04Label}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {pendingCount} {t.diagnostics.summaryPending} · {securityPendingCount} {t.diagnostics.summarySecurity}
              </div>
            </div>
          </div>
          <div
            className={`text-xs font-mono font-semibold shrink-0 ${
              pendingCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {installedCount} / {updates.length} {t.diagnostics.installedBadge}
          </div>
        </div>
      </div>

      {/* 3. Equipment Stress Test Console */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.diagnostics.stressSectionTitle}</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{t.diagnostics.stressSectionSub}</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              {isRunning
                ? `${t.diagnostics.remainingLabel} ${remainingSec}s`
                : hasCompletedOnce
                ? t.diagnostics.statusCompleted
                : t.diagnostics.statusIdle}
            </span>
            <span
              className={`font-semibold ${
                isRunning
                  ? 'text-amber-700 dark:text-amber-400'
                  : hasCompletedOnce
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {isRunning ? t.diagnostics.statusRunning : hasCompletedOnce ? t.diagnostics.statusCompleted : t.diagnostics.statusIdle}
            </span>
          </div>
        </div>

        {/* Stress Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              {t.diagnostics.profileLabel}
            </label>
            <select
              value={profile}
              disabled={isRunning}
              onChange={(e) => setProfile(e.target.value as StressProfile)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600 disabled:opacity-60"
            >
              <option value="cpu">{t.diagnostics.profiles.cpu}</option>
              <option value="memory">{t.diagnostics.profiles.memory}</option>
              <option value="io">{t.diagnostics.profiles.io}</option>
              <option value="full">{t.diagnostics.profiles.full}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              {t.diagnostics.intensityLabel}
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {(['low', 'medium', 'extreme'] as StressIntensity[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setIntensity(lvl)}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap ${
                    intensity === lvl
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {t.diagnostics.intensities[lvl]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              {t.diagnostics.durationLabel}
            </label>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex-1">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    disabled={isRunning}
                    onClick={() => {
                      setDurationSec(sec);
                      setRemainingSec(sec);
                    }}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                      durationSec === sec
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <button
                onClick={handleToggleStress}
                className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  isRunning
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-teal-700 hover:bg-teal-600 text-white'
                }`}
              >
                {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isRunning ? t.diagnostics.stopStressBtn : t.diagnostics.startStressBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Telemetry Grid + SVG Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">{t.diagnostics.cpuLoadMetric}</span>
              <span className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{cpuLoad}%</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> {t.diagnostics.tempMetric}
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{temperature}°C</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">{t.diagnostics.freqMetric}</span>
              <span className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">{clockGhz} GHz</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">{t.diagnostics.opsMetric}</span>
              <span className="text-lg font-bold font-mono tabular-nums text-teal-700 dark:text-teal-400">
                {opsPerSec > 0 ? opsPerSec.toLocaleString() : '—'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">{t.diagnostics.latencyMetric}</span>
              <span className="text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                {loopLatencyMs} ms
              </span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">{t.diagnostics.thermalStateMetric}</span>
              <span className={`text-sm font-bold font-mono ${thermalStatus.cls}`}>{thermalStatus.label}</span>
            </div>
          </div>

          {/* Live Time Series Chart */}
          <div className="lg:col-span-2 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2 flex-wrap gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                {t.diagnostics.chartTitle}
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                  <span className="w-2.5 h-0.5 bg-teal-600 dark:bg-teal-400"></span>
                  {t.diagnostics.chartLegendLoad}
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-600 dark:bg-amber-400"></span>
                  {t.diagnostics.chartLegendTemp}
                </span>
              </div>
            </div>

            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-36 overflow-visible">
              {[25, 50, 75, 100].map((lvl) => {
                const y = chartH - padY - (lvl / 100) * (chartH - padY * 2);
                return (
                  <g key={lvl}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartW - padX}
                      y2={y}
                      className="stroke-zinc-300/70 dark:stroke-zinc-800"
                      strokeDasharray="2,3"
                    />
                    <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-zinc-500 font-mono text-[9px]">
                      {lvl}
                    </text>
                  </g>
                );
              })}
              <polyline fill="none" stroke="#0f766e" strokeWidth="2.2" points={loadPoints} />
              <polyline fill="none" stroke="#d97706" strokeWidth="1.8" strokeDasharray="4,3" points={tempPoints} />
            </svg>

            {hasCompletedOnce && !isRunning && (
              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {t.diagnostics.summaryBanner} {t.diagnostics.summaryCompletedText} ({opsPerSec.toLocaleString()} ops/s)
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Operating System & Hardware Analysis */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.diagnostics.osSectionTitle}</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{t.diagnostics.osSectionSub}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {t.diagnostics.lastScanLabel} {lastScanTime}
            </span>
            <button
              onClick={handleDeepScan}
              disabled={isScanningOs}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningOs ? 'animate-spin' : ''}`} />
              <span>{isScanningOs ? t.diagnostics.scanningLabel : t.diagnostics.runDeepScanBtn}</span>
            </button>
          </div>
        </div>

        {/* Two Environment Cards: Local Client vs Linux Production Node */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Local Client Machine */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <Monitor className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.diagnostics.localClientTitle}</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldOs}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">{clientEnv.osName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldArch}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">
                  {clientEnv.cores} {t.sidebar.coresUnit}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldRam}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">{clientEnv.deviceMemory}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldGpu}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[240px]" title={clientEnv.gpuRenderer}>
                  {clientEnv.gpuRenderer}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldViewport}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">{clientEnv.screenRes}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldNetwork}:</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-right">{clientEnv.netInfo}</span>
              </div>
            </div>
          </div>

          {/* Linux Server Node */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <Server className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.diagnostics.nodeOsTitle}</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldDistro}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">Ubuntu 24.04.1 LTS (x86_64)</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldKernel}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">6.8.0-45-generic (PREEMPT_DYNAMIC)</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldRuntime}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">containerd 1.7.18 · Docker 26.0.1</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldSecurity}:</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-right">AppArmor Enforcing · Seccomp BPF</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldUptime}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">
                  {language === 'es' ? '21 días, 04h 18m' : '21 days, 04h 18m'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">{t.diagnostics.osFieldDescriptors}:</span>
                <span className="text-zinc-900 dark:text-zinc-100 text-right">4,182 / 1,048,576</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Partitions & Health Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.diagnostics.partitionsTitle}
            </h4>
            <div className="space-y-2">
              {partitions.map((p) => {
                const pct = Math.round((p.usedGb / p.totalGb) * 100);
                return (
                  <div
                    key={p.mount}
                    className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {p.mount} <span className="font-normal text-zinc-500">({p.device})</span>
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {p.usedGb} / {p.totalGb} GB ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-600 dark:bg-teal-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t.diagnostics.checksTitle}
            </h4>
            <div className="space-y-2">
              {osChecks.map((chk) => (
                <div
                  key={chk.nameEn}
                  className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {language === 'es' ? chk.nameEs : chk.nameEn}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {language === 'es' ? chk.detailEs : chk.detailEn}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
                      chk.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {chk.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {chk.ok ? t.diagnostics.checkPassed : t.diagnostics.checkWarning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Equipment & System Updates Manager */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.diagnostics.updatesSectionTitle}</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{t.diagnostics.updatesSectionSub}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdates ? t.diagnostics.checkingUpdatesBtn : t.diagnostics.checkUpdatesBtn}</span>
            </button>
            <button
              onClick={handleInstallAllPending}
              disabled={pendingCount === 0}
              className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {t.diagnostics.installAllBtn} ({pendingCount})
              </span>
            </button>
          </div>
        </div>

        {/* Summary Strip & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-400 flex-wrap">
            <span>
              <strong className="text-zinc-900 dark:text-zinc-100 tabular-nums">{pendingCount}</strong>{' '}
              {t.diagnostics.summaryPending}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-amber-700 dark:text-amber-400 tabular-nums">{securityPendingCount}</strong>{' '}
              {t.diagnostics.summarySecurity}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">{installedCount}</strong>{' '}
              {t.diagnostics.summaryInstalled}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.diagnostics.summaryLastCheck}: {lastUpdateCheck}
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {(['all', 'pending', 'security', 'installed'] as const).map((tabKey) => {
              const labelMap = {
                all: t.diagnostics.filterAll,
                pending: t.diagnostics.filterPending,
                security: t.diagnostics.filterSecurity,
                installed: t.diagnostics.filterInstalled,
              };
              return (
                <button
                  key={tabKey}
                  onClick={() => setUpdateFilter(tabKey)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    updateFilter === tabKey
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {labelMap[tabKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Updates Table */}
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                <th className="p-3 pl-4">{language === 'es' ? 'Paquete' : 'Package'}</th>
                <th className="p-3">{language === 'es' ? 'Severidad' : 'Severity'}</th>
                <th className="p-3">{language === 'es' ? 'Versión' : 'Version'}</th>
                <th className="p-3 text-right">{language === 'es' ? 'Tamaño' : 'Size'}</th>
                <th className="p-3 pr-4 text-right">{language === 'es' ? 'Acción' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUpdates.map((item) => {
                const severityColor =
                  item.severity === 'critical'
                    ? 'text-red-700 dark:text-red-400'
                    : item.severity === 'security'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-zinc-600 dark:text-zinc-400';

                return (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 pl-4">
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{item.packageName}</div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {t.diagnostics.categoryLabels[item.category]} · {language === 'es' ? item.summaryEs : item.summaryEn}
                      </div>
                    </td>
                    <td className={`p-3 font-mono font-semibold whitespace-nowrap ${severityColor}`}>
                      {t.diagnostics.severityLabels[item.severity]}
                    </td>
                    <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap tabular-nums">
                      {item.currentVersion} &rarr; <strong className="text-zinc-900 dark:text-zinc-100">{item.targetVersion}</strong>
                    </td>
                    <td className="p-3 font-mono text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                      {item.sizeMb} MB
                    </td>
                    <td className="p-3 pr-4 text-right whitespace-nowrap">
                      {item.status === 'installed' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t.diagnostics.installedBadge}
                        </span>
                      ) : item.status === 'installing' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-amber-700 dark:text-amber-400 font-semibold">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t.diagnostics.installingBtn}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstallOne(item.id)}
                          className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          {t.diagnostics.installBtn}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUpdates.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500 font-mono text-xs">
                    {t.diagnostics.noUpdatesMatch}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
