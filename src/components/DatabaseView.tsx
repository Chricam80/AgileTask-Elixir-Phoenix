import React, { useState } from 'react';
import {
  Database,
  Server,
  Kanban,
  TableProperties,
  Plus,
  RefreshCw,
  Trash2,
  Download,
  Container,
} from 'lucide-react';
import { Microservice, KanbanTask, MatrixItem } from '../types';
import {
  saveMicroservice,
  saveTask,
  deleteTask,
  saveMatrixItem,
  deleteMatrixItem,
  seedDatabase,
} from '../services/dbService';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface DatabaseViewProps {
  microservices: Microservice[];
  tasks: KanbanTask[];
  matrixItems: MatrixItem[];
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  microservices,
  tasks,
  matrixItems,
}) => {
  const { t } = useAppSettings();
  const [activeSubTab, setActiveSubTab] = useState<'microservices' | 'kanban' | 'matrix'>('microservices');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Microservice form state
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcImage, setNewSvcImage] = useState('');
  const [newSvcPort, setNewSvcPort] = useState<number>(8085);
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcTech, setNewSvcTech] = useState('');
  const [newSvcCpu, setNewSvcCpu] = useState<number>(15);
  const [newSvcRam] = useState<number>(450);

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'backend' | 'frontend' | 'devops'>('backend');
  const [newTaskSp, setNewTaskSp] = useState<number>(5);
  const [newTaskStatus, setNewTaskStatus] = useState<KanbanTask['status']>('col-todo');

  // Matrix form state
  const [newMatrixCode, setNewMatrixCode] = useState('OE-05');
  const [newMatrixObj, setNewMatrixObj] = useState('');
  const [newMatrixMethod, setNewMatrixMethod] = useState('Scrum + TDD');
  const [newMatrixTech, setNewMatrixTech] = useState('Spring Boot, Docker');
  const [newMatrixOutcome, setNewMatrixOutcome] = useState('');
  const [newMatrixImpact, setNewMatrixImpact] = useState('+45% Eficiencia');
  const [newMatrixCat, setNewMatrixCat] = useState<'metodologico' | 'arquitectura' | 'calidad'>('arquitectura');

  const getLocalizedStatus = (status: KanbanTask['status']) => {
    switch (status) {
      case 'col-todo':
        return t.agile.colTodo;
      case 'col-progress':
        return t.agile.colProgress;
      case 'col-review':
        return t.agile.colReview;
      case 'col-done':
        return t.agile.colDone;
    }
  };

  const handleSeed = async (force: boolean) => {
    setIsSeeding(true);
    try {
      await seedDatabase(force);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Error seeding database:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateMicroservice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName.trim()) return;

    const newSvc: Microservice = {
      id: newSvcName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: newSvcName.trim(),
      dockerImage: newSvcImage.trim() || `sandoval/${newSvcName.trim()}:v1.0-alpine`,
      imageSize: '145MB',
      port: Number(newSvcPort) || 8080,
      protocol: 'HTTP',
      description: newSvcDesc.trim() || t.database.svcDefaultDesc,
      frameworkSpec: t.database.svcDefaultSpec,
      techDetail: newSvcTech.trim() || 'Java 21 LTS + Spring Boot 3.2',
      podsCount: 3,
      cpuUsage: Number(newSvcCpu) || 15,
      ramAllocMb: Number(newSvcRam) || 450,
      latencyP99Ms: 16,
      status: '200 OK',
    };

    await saveMicroservice(newSvc);
    setNewSvcName('');
    setNewSvcImage('');
    setNewSvcDesc('');
    setNewSvcTech('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || t.database.taskDefaultDesc,
      category: newTaskCategory,
      storyPoints: Number(newTaskSp) || 5,
      status: newTaskStatus,
      author: 'Christian Sandoval',
    };

    await saveTask(newTask);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const handleCreateMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatrixObj.trim()) return;

    const newMatrix: MatrixItem = {
      id: `matrix-${Date.now()}`,
      code: newMatrixCode.trim() || 'OE-05',
      objective: newMatrixObj.trim(),
      methodology: newMatrixMethod.trim(),
      methodologyIcon: 'check-circle',
      technology: newMatrixTech.split(',').map((s) => s.trim()).filter(Boolean),
      outcome: newMatrixOutcome.trim() || t.database.matrixDefaultOutcome,
      quantitativeImpact: newMatrixImpact.trim(),
      category: newMatrixCat,
    };

    await saveMatrixItem(newMatrix);
    setNewMatrixObj('');
    setNewMatrixOutcome('');
  };

  const exportAllData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      microservices,
      kanbanTasks: tasks,
      matrixItems,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'DevAgile_Database_Backup.json');
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Matte Banner: Database Infrastructure Information */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-teal-700 dark:text-teal-400 font-mono uppercase tracking-wider mb-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{t.database.kicker}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.database.title}
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              {t.database.desc}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => handleSeed(true)}
              disabled={isSeeding}
              className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{seedSuccess ? t.database.resetSuccessBtn : t.database.resetBtn}</span>
            </button>
            <button
              onClick={exportAllData}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.database.exportJsonBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cascading Database Telemetry Waterfall */}
      <div className="flex flex-col gap-2 text-xs font-mono">
        <div className="lg:ml-0 lg:mr-14 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">01 · {t.database.specEngine}</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{t.database.specEngineVal}</span>
        </div>
        <div className="lg:ml-5 lg:mr-9 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">02 · {t.database.specLicense}</span>
          <span className="text-teal-700 dark:text-teal-400 font-bold">{t.database.specLicenseVal}</span>
        </div>
        <div className="lg:ml-10 lg:mr-5 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">03 · {t.database.specSync}</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">{t.database.specSyncVal}</span>
        </div>
        <div className="lg:ml-15 lg:mr-0 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">04 · {t.database.specConn}</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{t.common.active}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('microservices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'microservices'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Server className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span className="tabular-nums">
            {t.database.tabMicroservices} ({microservices.length})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('kanban')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'kanban'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Kanban className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span className="tabular-nums">
            {t.database.tabKanban} ({tasks.length})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'matrix'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TableProperties className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="tabular-nums">
            {t.database.tabMatrix} ({matrixItems.length})
          </span>
        </button>
      </div>

      {/* Sub-Tab 1: MICROSERVICES FEEDER */}
      {activeSubTab === 'microservices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.database.svcFormTitle}</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{t.database.svcFormDesc}</p>

            <form onSubmit={handleCreateMicroservice} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.svcNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newSvcName}
                  onChange={(e) => setNewSvcName(e.target.value)}
                  placeholder={t.database.svcNamePlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.svcImageLabel}
                </label>
                <input
                  type="text"
                  value={newSvcImage}
                  onChange={(e) => setNewSvcImage(e.target.value)}
                  placeholder={t.database.svcImagePlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    {t.database.svcPortLabel}
                  </label>
                  <input
                    type="number"
                    value={newSvcPort}
                    onChange={(e) => setNewSvcPort(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    {t.database.svcCpuLabel}
                  </label>
                  <input
                    type="number"
                    value={newSvcCpu}
                    onChange={(e) => setNewSvcCpu(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.svcDescLabel}
                </label>
                <input
                  type="text"
                  value={newSvcDesc}
                  onChange={(e) => setNewSvcDesc(e.target.value)}
                  placeholder={t.database.svcDescPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.svcTechLabel}
                </label>
                <input
                  type="text"
                  value={newSvcTech}
                  onChange={(e) => setNewSvcTech(e.target.value)}
                  placeholder={t.database.svcTechPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer mt-2"
              >
                {t.database.svcSubmitBtn}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Container className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>
                    {t.database.svcListTitle} ({microservices.length})
                  </span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  {t.database.svcCollection}
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[440px] custom-scrollbar pr-1">
                {microservices.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap font-mono">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{svc.name}</span>
                        <span className="text-[11px] text-teal-700 dark:text-teal-400">
                          · {t.database.svcPort} {svc.port}
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">· {svc.status}</span>
                      </div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">{svc.description}</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5 tabular-nums">
                        {svc.dockerImage} · CPU: {svc.cpuUsage}% · RAM: {svc.ramAllocMb} MB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between">
              <span>{t.database.svcSyncNote}</span>
              <span className="text-teal-700 dark:text-teal-400 font-mono">{t.database.svcPersistenceNote}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: KANBAN TASKS FEEDER */}
      {activeSubTab === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{t.database.taskFormTitle}</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.taskTitleLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={t.database.taskTitlePlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.taskDescLabel}
                </label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder={t.database.taskDescPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    {t.database.taskLayerLabel}
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="backend">{t.database.taskLayerBackend}</option>
                    <option value="frontend">{t.database.taskLayerFrontend}</option>
                    <option value="devops">{t.database.taskLayerDevops}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    {t.database.taskSpLabel}
                  </label>
                  <select
                    value={newTaskSp}
                    onChange={(e) => setNewTaskSp(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value={1}>1 SP</option>
                    <option value={2}>2 SP</option>
                    <option value={3}>3 SP</option>
                    <option value={5}>5 SP</option>
                    <option value={8}>8 SP</option>
                    <option value={13}>13 SP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.taskColLabel}
                </label>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="col-todo">{t.agile.colTodo}</option>
                  <option value="col-progress">{t.agile.colProgress}</option>
                  <option value="col-review">{t.agile.colReview}</option>
                  <option value="col-done">{t.agile.colDone}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer mt-2"
              >
                {t.database.taskSubmitBtn}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>
                    {t.database.taskListTitle} ({tasks.length})
                  </span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  {t.database.taskCollection}
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[440px] custom-scrollbar pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{task.title}</span>
                        <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold tabular-nums">
                          · {task.storyPoints} SP
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                          · {getLocalizedStatus(task.status)}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 truncate">{task.description}</div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title={t.database.taskDeleteTitle}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between">
              <span>{t.database.taskSyncNote}</span>
              <span className="text-amber-700 dark:text-amber-400 font-mono">{t.database.taskRwNote}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: RESEARCH MATRIX FEEDER */}
      {activeSubTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.database.matrixFormTitle}</span>
            </h3>

            <form onSubmit={handleCreateMatrix} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    {t.database.matrixCodeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatrixCode}
                    onChange={(e) => setNewMatrixCode(e.target.value)}
                    placeholder="OE-05"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    {t.database.matrixLevelLabel}
                  </label>
                  <select
                    value={newMatrixCat}
                    onChange={(e) => setNewMatrixCat(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="metodologico">{t.database.matrixLevelMethod}</option>
                    <option value="arquitectura">{t.database.matrixLevelArch}</option>
                    <option value="calidad">{t.database.matrixLevelQuality}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.matrixObjLabel}
                </label>
                <textarea
                  rows={2}
                  required
                  value={newMatrixObj}
                  onChange={(e) => setNewMatrixObj(e.target.value)}
                  placeholder={t.database.matrixObjPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.matrixMethodLabel}
                </label>
                <input
                  type="text"
                  value={newMatrixMethod}
                  onChange={(e) => setNewMatrixMethod(e.target.value)}
                  placeholder={t.database.matrixMethodPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.matrixTechLabel}
                </label>
                <input
                  type="text"
                  value={newMatrixTech}
                  onChange={(e) => setNewMatrixTech(e.target.value)}
                  placeholder={t.database.matrixTechPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  {t.database.matrixImpactLabel}
                </label>
                <input
                  type="text"
                  value={newMatrixImpact}
                  onChange={(e) => setNewMatrixImpact(e.target.value)}
                  placeholder={t.database.matrixImpactPlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-700 dark:text-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer mt-2"
              >
                {t.database.matrixSubmitBtn}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <TableProperties className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>
                    {t.database.matrixListTitle} ({matrixItems.length})
                  </span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  {t.database.matrixCollection}
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[440px] custom-scrollbar pr-1">
                {matrixItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-700 dark:text-teal-400 font-mono">{item.code}:</span>
                        <span className="text-zinc-900 dark:text-zinc-50 font-medium">{item.objective}</span>
                      </div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                        {t.database.matrixPracticePrefix}{' '}
                        <strong className="text-zinc-800 dark:text-zinc-200">{item.methodology}</strong> ·{' '}
                        {t.database.matrixTechPrefix} {item.technology.join(', ')}
                      </div>
                      <div className="mt-1 font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                        {item.quantitativeImpact}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMatrixItem(item.id)}
                      className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title={t.database.taskDeleteTitle}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between">
              <span>{t.database.matrixSyncNote}</span>
              <span className="text-teal-700 dark:text-teal-400 font-mono">{t.database.matrixCollectionActive}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
