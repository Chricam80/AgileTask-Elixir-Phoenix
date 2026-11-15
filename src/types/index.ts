export type ActiveTab = 'k8s' | 'diagnostics' | 'dashboard' | 'agile' | 'architecture' | 'matrix' | 'database';
export type FrontendFramework = 'react' | 'angular';

export interface SystemUpdateItem {
  id: string;
  packageName: string;
  category: 'kernel' | 'runtime' | 'container' | 'security' | 'firmware';
  severity: 'critical' | 'security' | 'maintenance';
  currentVersion: string;
  targetVersion: string;
  sizeMb: number;
  status: 'pending' | 'installing' | 'installed';
  summaryEs: string;
  summaryEn: string;
}

export interface Microservice {
  id: string;
  name: string;
  dockerImage: string;
  imageSize: string;
  port: number;
  protocol: string;
  description: string;
  frameworkSpec: string;
  techDetail: string;
  podsCount: number;
  cpuUsage: number;
  ramAllocMb: number;
  latencyP99Ms: number;
  status: '200 OK' | 'DEGRADED' | 'STARTING';
}

export interface PodInfo {
  id: string;
  serviceId: string;
  podName: string;
  dockerId: string;
  status: string;
  uptime: string;
  restarts: number;
  oomKilled: boolean;
  serviceMesh: string;
  ingressRoute: string;
  cpuReq: string;
  cpuLimit: string;
  cpuPct: number;
  ramReq: string;
  ramLimit: string;
  ramPct: number;
  logs: Array<{
    timestamp: string;
    level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
    tag: string;
    message: string;
  }>;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  category: 'backend' | 'frontend' | 'devops';
  storyPoints: number;
  status: 'col-todo' | 'col-progress' | 'col-review' | 'col-done';
  author: string;
}

export interface MatrixItem {
  id: string;
  code: string;
  objective: string;
  methodology: string;
  methodologyIcon: string;
  technology: string[];
  outcome: string;
  quantitativeImpact: string;
  category: 'metodologico' | 'arquitectura' | 'calidad';
}

export interface RestEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  name: string;
  description: string;
  defaultLatencyMs: number;
  getResponse: (framework: FrontendFramework, podsCount: number) => any;
}
