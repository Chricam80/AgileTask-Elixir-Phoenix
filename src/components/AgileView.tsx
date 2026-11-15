import React from 'react';
import {
  Trello,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  User,
  LineChart,
  CheckSquare,
  Trash2,
} from 'lucide-react';
import { KanbanTask, FrontendFramework } from '../types';
import { VelocityChart } from './VelocityChart';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface AgileViewProps {
  tasks: KanbanTask[];
  onMoveTask: (taskId: string, targetCol: KanbanTask['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  currentFramework: FrontendFramework;
}

export const AgileView: React.FC<AgileViewProps> = ({
  tasks,
  onMoveTask,
  onDeleteTask,
  onOpenAddTask,
  currentFramework,
}) => {
  const { t } = useAppSettings();

  const todoTasks = tasks.filter((tItem) => tItem.status === 'col-todo');
  const progressTasks = tasks.filter((tItem) => tItem.status === 'col-progress');
  const reviewTasks = tasks.filter((tItem) => tItem.status === 'col-review');
  const doneTasks = tasks.filter((tItem) => tItem.status === 'col-done');

  const totalPoints = tasks.reduce((acc, tItem) => acc + tItem.storyPoints, 0);
  const donePoints = doneTasks.reduce((acc, tItem) => acc + tItem.storyPoints, 0);
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const getCategoryClass = (category: KanbanTask['category']) => {
    if (category === 'backend') return 'text-emerald-700 dark:text-emerald-400';
    if (category === 'frontend') return 'text-teal-700 dark:text-teal-400';
    return 'text-amber-700 dark:text-amber-400';
  };

  return (
    <div className="space-y-6">
      {/* Sprint Controls & Velocity Summary Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1 font-mono text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400">{t.agile.sprintBadge}</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-500 dark:text-zinc-400">{t.agile.sprintDates}</span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{t.agile.sprintGoal}</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-48 text-right">
            <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 mb-1">
              <span className="text-zinc-500 dark:text-zinc-400">{t.agile.sprintProgress}</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {progressPercent}% ({donePoints}/{totalPoints} {t.agile.ptsUnit})
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-700 dark:bg-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.agile.newTaskBtn}</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <Trello className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>{t.agile.boardTitle}</span>
          </h4>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.agile.boardHint}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column 1: Por Hacer (To Do) */}
          <div className="bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase">{t.agile.colTodo}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-teal-600 dark:hover:border-teal-500 rounded-lg p-3 shadow-sm dark:shadow-none transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-mono font-semibold ${getCategoryClass(task.category)}`}>
                      {task.category === 'backend'
                        ? t.agile.catBackendSpring
                        : task.category === 'frontend'
                        ? `Frontend · ${currentFramework === 'react' ? 'React SPA' : 'Angular'}`
                        : t.agile.catDevopsCi}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold tabular-nums">
                      {task.storyPoints} SP
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{task.title}</h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">{task.description}</p>
                  <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>{task.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                        title={t.agile.deleteTaskTitle}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMoveTask(task.id, 'col-progress')}
                        className="text-[10px] text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t.agile.moveBtn}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: En Progreso (In Progress) */}
          <div className="bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase">
                  {t.agile.colProgress}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{t.agile.wipLimit}</span>
                <span
                  className={`text-xs font-mono font-bold tabular-nums ${
                    progressTasks.length > 3 ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {progressTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {progressTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-teal-600 dark:hover:border-teal-500 rounded-lg p-3 shadow-sm dark:shadow-none transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-mono font-semibold ${getCategoryClass(task.category)}`}>
                      {task.category === 'backend'
                        ? t.agile.catBackendSpring
                        : task.category === 'frontend'
                        ? `Frontend · ${currentFramework === 'react' ? 'React SPA' : 'Angular'}`
                        : t.agile.catDevopsCi}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold tabular-nums">
                      {task.storyPoints} SP
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{task.title}</h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">{task.description}</p>
                  <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => onMoveTask(task.id, 'col-todo')}
                      className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>{t.agile.backBtn}</span>
                    </button>
                    <button
                      onClick={() => onMoveTask(task.id, 'col-review')}
                      className="text-[10px] text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t.agile.reviewBtn}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: En Code Review (Review) */}
          <div className="bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400"></span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase">
                  {t.agile.colReview}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                {reviewTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {reviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-teal-600 dark:hover:border-teal-500 rounded-lg p-3 shadow-sm dark:shadow-none transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-mono font-semibold ${getCategoryClass(task.category)}`}>
                      {task.category === 'backend'
                        ? t.agile.catBackendSec
                        : task.category === 'frontend'
                        ? `Frontend · ${currentFramework === 'react' ? 'React SPA' : 'Angular'}`
                        : t.agile.catDevopsCi}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold tabular-nums">
                      {task.storyPoints} SP
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{task.title}</h5>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">{task.description}</p>
                  <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => onMoveTask(task.id, 'col-progress')}
                      className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>{t.agile.progressBtn}</span>
                    </button>
                    <button
                      onClick={() => onMoveTask(task.id, 'col-done')}
                      className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t.agile.approveBtn}</span>
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Completado (Done) */}
          <div className="bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase">
                  {t.agile.colDone}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm dark:shadow-none opacity-90 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-mono font-semibold ${getCategoryClass(task.category)}`}>
                      {task.category === 'devops'
                        ? t.agile.catDevopsDocker
                        : task.category === 'frontend'
                        ? t.agile.catFrontendClient
                        : t.agile.catBackendShort}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-0.5 font-bold">
                      <Check className="w-3 h-3" /> {t.agile.doneTag}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 line-through leading-snug">
                    {task.title}
                  </h5>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{task.description}</p>
                  <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    <span className="tabular-nums">
                      {t.agile.storyPointsLabel} {task.storyPoints}
                    </span>
                    <button
                      onClick={() => onMoveTask(task.id, 'col-review')}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                      title={t.agile.reopenTitle}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.agile.reopenBtn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrum Velocity & Burndown Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>{t.agile.velocityTitle}</span>
          </h4>
          <VelocityChart />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">{t.agile.velocityFootnote}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.agile.backlogTitle}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 shrink-0"></span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{t.agile.backlogItems[0].text}</span>
                </div>
                <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] shrink-0">
                  {t.agile.backlogItems[0].meta}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0"></span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{t.agile.backlogItems[1].text}</span>
                </div>
                <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] shrink-0">
                  {t.agile.backlogItems[1].meta}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"></span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{t.agile.backlogItems[2].text}</span>
                </div>
                <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] shrink-0">
                  {t.agile.backlogItems[2].meta}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>{t.agile.backlogTotal}</span>
            <span className="text-teal-700 dark:text-teal-400 font-mono font-medium">{t.agile.backlogSprints}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
