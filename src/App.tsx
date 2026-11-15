import { useState, useEffect, useMemo } from 'react';
import { ActiveTab, FrontendFramework, KanbanTask, Microservice, MatrixItem } from './types';
import {
  INITIAL_MICROSERVICES,
  INITIAL_PODS,
  INITIAL_KANBAN_TASKS,
  MATRIX_ITEMS,
  getLocalizedMicroservice,
  getLocalizedPods,
  getLocalizedTask,
  getLocalizedMatrixItem,
} from './data/mockData';
import { AppSettingsProvider, useAppSettings } from './contexts/AppSettingsContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { K8sMonitorView } from './components/K8sMonitorView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { DashboardView } from './components/DashboardView';
import { AgileView } from './components/AgileView';
import { ArchitectureView } from './components/ArchitectureView';
import { MatrixView } from './components/MatrixView';
import { DatabaseView } from './components/DatabaseView';
import { ApiSimulatorModal } from './components/ApiSimulatorModal';
import { ManifestModal } from './components/ManifestModal';
import { AddTaskModal } from './components/AddTaskModal';
import {
  subscribeMicroservices,
  subscribeTasks,
  subscribeMatrix,
  saveTask,
  deleteTask,
  seedDatabase,
  testFirestoreConnection,
} from './services/dbService';

function AppContent() {
  const { language, isDarkTheme, toggleTheme } = useAppSettings();
  const [activeTab, setActiveTab] = useState<ActiveTab>('k8s');
  const [currentFramework, setCurrentFramework] = useState<FrontendFramework>('react');

  // Modals
  const [isApiSimulatorOpen, setIsApiSimulatorOpen] = useState<boolean>(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);

  // Dynamic Cluster and Microservices State
  const [microservices, setMicroservices] = useState<Microservice[]>(INITIAL_MICROSERVICES);
  const [pods] = useState(INITIAL_PODS);
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_KANBAN_TASKS);
  const [matrixItems, setMatrixItems] = useState<MatrixItem[]>(MATRIX_ITEMS);
  const [isHpaScaled, setIsHpaScaled] = useState<boolean>(false);

  // Connect to Firestore real-time subscriptions and test connection
  useEffect(() => {
    testFirestoreConnection();

    seedDatabase(false).catch((e) => console.log('DB seed check:', e));

    const unsubServices = subscribeMicroservices((data) => {
      if (data && data.length > 0) setMicroservices(data);
    });

    const unsubTasks = subscribeTasks((data) => {
      if (data && data.length > 0) setTasks(data);
    });

    const unsubMatrix = subscribeMatrix((data) => {
      if (data && data.length > 0) setMatrixItems(data);
    });

    return () => {
      unsubServices();
      unsubTasks();
      unsubMatrix();
    };
  }, []);

  const localizedMicroservices = useMemo(
    () => microservices.map((svc) => getLocalizedMicroservice(svc, language)),
    [microservices, language]
  );

  const localizedPods = useMemo(
    () => getLocalizedPods(pods, language),
    [pods, language]
  );

  const localizedTasks = useMemo(
    () => tasks.map((task) => getLocalizedTask(task, language)),
    [tasks, language]
  );

  const localizedMatrixItems = useMemo(
    () => matrixItems.map((item) => getLocalizedMatrixItem(item, language)),
    [matrixItems, language]
  );

  const handleToggleHpa = () => {
    setIsHpaScaled((prev) => !prev);
  };

  // Move task across Kanban columns and sync to Firestore
  const handleMoveTask = async (taskId: string, targetCol: KanbanTask['status']) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: targetCol };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updatedTask : t))
    );

    try {
      await saveTask(updatedTask);
    } catch (e) {
      console.error('Error saving moved task to Firestore:', e);
    }
  };

  // Delete task from Firestore
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (e) {
      console.error('Error deleting task from Firestore:', e);
    }
  };

  // Add new task to Firestore
  const handleAddTask = async (newTaskData: Omit<KanbanTask, 'id'>) => {
    const newId = `card-${Date.now()}`;
    const newTask: KanbanTask = { id: newId, ...newTaskData };
    setTasks((prev) => [newTask, ...prev]);

    try {
      await saveTask(newTask);
    } catch (e) {
      console.error('Error adding task to Firestore:', e);
    }
  };

  // Derived cluster telemetry
  const totalPods = isHpaScaled ? 32 : 24;
  const cpuUsedCores = isHpaScaled ? 10.88 : 7.68;
  const ramUsedGb = isHpaScaled ? 48.64 : 39.68;

  return (
    <div className="min-h-screen flex antialiased transition-colors duration-200 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentFramework={currentFramework}
        onFrameworkChange={setCurrentFramework}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
        totalPods={totalPods}
        cpuUsedCores={cpuUsedCores}
        ramUsedGb={ramUsedGb}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          currentFramework={currentFramework}
          onOpenApiSimulator={() => setIsApiSimulatorOpen(true)}
        />

        {/* Tab Content Viewport */}
        <div className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'k8s' && (
            <K8sMonitorView
              microservices={localizedMicroservices}
              pods={localizedPods}
              currentFramework={currentFramework}
              totalPods={totalPods}
              cpuUsedCores={cpuUsedCores}
              ramUsedGb={ramUsedGb}
              isHpaScaled={isHpaScaled}
              onToggleHpa={handleToggleHpa}
              onOpenManifests={() => setIsManifestModalOpen(true)}
            />
          )}

          {activeTab === 'diagnostics' && <DiagnosticsView />}

          {activeTab === 'dashboard' && (
            <DashboardView currentFramework={currentFramework} />
          )}

          {activeTab === 'agile' && (
            <AgileView
              tasks={localizedTasks}
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
              onOpenAddTask={() => setIsAddTaskModalOpen(true)}
              currentFramework={currentFramework}
            />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureView
              currentFramework={currentFramework}
              onOpenApiSimulator={() => setIsApiSimulatorOpen(true)}
            />
          )}

          {activeTab === 'matrix' && <MatrixView items={localizedMatrixItems} />}

          {activeTab === 'database' && (
            <DatabaseView
              microservices={localizedMicroservices}
              tasks={localizedTasks}
              matrixItems={localizedMatrixItems}
            />
          )}
        </div>
      </main>

      {/* Interactive Modals */}
      <ApiSimulatorModal
        isOpen={isApiSimulatorOpen}
        onClose={() => setIsApiSimulatorOpen(false)}
        currentFramework={currentFramework}
        totalPods={totalPods}
      />

      <ManifestModal
        isOpen={isManifestModalOpen}
        onClose={() => setIsManifestModalOpen(false)}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppSettingsProvider>
      <AppContent />
    </AppSettingsProvider>
  );
}
