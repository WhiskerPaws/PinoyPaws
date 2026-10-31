import React, { useState, useEffect, useRef } from 'react';
import { Task, CalendarBlock, PomodoroMode, TaskPriority, SubTask } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  Zap,
  Headphones,
  Volume2,
  VolumeX,
  Tag,
  Filter,
  Search,
  X,
  Flag,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  ListChecks,
  ListPlus,
} from 'lucide-react';
import { playPomodoroChime, playButtonTap, playCoinSound } from '../../utils/audio';

export const TASK_PRIORITIES: Record<
  TaskPriority,
  {
    name: TaskPriority;
    dotColor: string;
    badgeBg: string;
    textColor: string;
    borderColor: string;
    iconSymbol: string;
    shortLabel: string;
    ringColor: string;
  }
> = {
  High: {
    name: 'High',
    dotColor: 'bg-rose-500',
    badgeBg: 'bg-rose-500/15',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    iconSymbol: '▲',
    shortLabel: 'High',
    ringColor: 'ring-rose-500/30',
  },
  Medium: {
    name: 'Medium',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    iconSymbol: '●',
    shortLabel: 'Med',
    ringColor: 'ring-amber-500/30',
  },
  Low: {
    name: 'Low',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    iconSymbol: '▼',
    shortLabel: 'Low',
    ringColor: 'ring-emerald-500/30',
  },
};

export const TASK_CATEGORIES: Record<
  Task['category'],
  {
    name: string;
    dotColor: string;
    badgeBg: string;
    textColor: string;
    borderColor: string;
    chipBorder: string;
    ringColor: string;
  }
> = {
  Work: {
    name: 'Work',
    dotColor: 'bg-blue-400',
    badgeBg: 'bg-blue-500/10',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500/30',
    chipBorder: 'border-blue-500/40',
    ringColor: 'ring-blue-400/30',
  },
  Personal: {
    name: 'Personal',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/30',
    chipBorder: 'border-emerald-500/40',
    ringColor: 'ring-emerald-400/30',
  },
  Study: {
    name: 'Study',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/10',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/30',
    chipBorder: 'border-amber-500/40',
    ringColor: 'ring-amber-400/30',
  },
  Health: {
    name: 'Health',
    dotColor: 'bg-rose-400',
    badgeBg: 'bg-rose-500/10',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-500/30',
    chipBorder: 'border-rose-500/40',
    ringColor: 'ring-rose-400/30',
  },
  Creative: {
    name: 'Creative',
    dotColor: 'bg-purple-400',
    badgeBg: 'bg-purple-500/10',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/30',
    chipBorder: 'border-purple-500/40',
    ringColor: 'ring-purple-400/30',
  },
};

interface RoutineHubProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  calendar: CalendarBlock[];
  onCalendarChange: (blocks: CalendarBlock[]) => void;
  onSessionCompleted: () => void; // triggers interstitial ad!
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  ambiencePlaying?: boolean;
  ambienceType?: 'white_noise' | 'forest_sounds';
  onToggleAmbience?: () => void;
}

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const RoutineHub: React.FC<RoutineHubProps> = ({
  tasks,
  onTasksChange,
  calendar,
  onCalendarChange,
  onSessionCompleted,
  activeTaskId,
  setActiveTaskId,
  ambiencePlaying = false,
  ambienceType = 'white_noise',
  onToggleAmbience,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsToday, setCompletedSessionsToday] = useState(3);
  const [customMinutes, setCustomMinutes] = useState(25);

  // Category & Priority Filter and Search for Backlog
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('Work');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskEst, setNewTaskEst] = useState(2);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<string[]>([]);
  const [draftSubtaskText, setDraftSubtaskText] = useState('');

  // Subtask drawer expansion and inline input states
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({
    'task-1': true,
  });
  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});

  // New calendar block input state
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalHour, setNewCalHour] = useState(14);
  const [showAddCal, setShowAddCal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playPomodoroChime();

            // Increment active task completed pomodoro
            if (activeTaskId) {
              onTasksChange(
                tasks.map((t) =>
                  t.id === activeTaskId
                    ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
                    : t
                )
              );
            }

            setCompletedSessionsToday((c) => c + 1);

            // Trigger Interstitial Ad for Pawcoins reward!
            onSessionCompleted();
            return MODE_DURATIONS[mode];
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, activeTaskId, tasks, onTasksChange, onSessionCompleted]);

  const switchMode = (newMode: PomodoroMode) => {
    playButtonTap();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleCustomDuration = (mins: number) => {
    playButtonTap();
    setIsRunning(false);
    setCustomMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const toggleTimer = () => {
    playButtonTap();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playButtonTap();
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  // Immediate simulation of timer end so user can test AdMob Interstitial flow easily
  const handleSimulateFinish = () => {
    playButtonTap();
    setIsRunning(false);
    playPomodoroChime();
    if (activeTaskId) {
      onTasksChange(
        tasks.map((t) =>
          t.id === activeTaskId
            ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
            : t
        )
      );
    }
    setCompletedSessionsToday((c) => c + 1);
    onSessionCompleted();
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Task actions
  const handleToggleTask = (id: string) => {
    playButtonTap();
    onTasksChange(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleUpdateTaskCategory = (id: string, newCategory: Task['category'], e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();
    onTasksChange(
      tasks.map((t) => (t.id === id ? { ...t, category: newCategory } : t))
    );
  };

  const handleUpdateTaskPriority = (id: string, newPriority: TaskPriority, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();
    onTasksChange(
      tasks.map((t) => (t.id === id ? { ...t, priority: newPriority } : t))
    );
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playButtonTap();
    if (activeTaskId === id) setActiveTaskId(null);
    onTasksChange(tasks.filter((t) => t.id !== id));
  };

  // Subtask handlers
  const handleToggleExpandTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();
    setExpandedTaskIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleSubTask = (taskId: string, subtaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();

    onTasksChange(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        const currentSubtasks = task.subtasks || [];
        const updatedSubtasks = currentSubtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...task, subtasks: updatedSubtasks };
      })
    );
  };

  const handleAddSubTask = (taskId: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const val = (inlineSubtaskInputs[taskId] || '').trim();
    if (!val) return;
    playButtonTap();

    const newSub: SubTask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: val,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onTasksChange(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: [...(task.subtasks || []), newSub],
        };
      })
    );

    setInlineSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
    setExpandedTaskIds((prev) => ({ ...prev, [taskId]: true }));
  };

  const handleDeleteSubTask = (taskId: string, subtaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();

    onTasksChange(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: (task.subtasks || []).filter((st) => st.id !== subtaskId),
        };
      })
    );
  };

  const handleAddDraftSubtask = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const val = draftSubtaskText.trim();
    if (!val) return;
    playButtonTap();
    setNewTaskSubtasks((prev) => [...prev, val]);
    setDraftSubtaskText('');
  };

  const handleRemoveDraftSubtask = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();
    setNewTaskSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    playButtonTap();

    const createdId = `task-${Date.now()}`;
    const created: Task = {
      id: createdId,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      estimatedPomodoros: Number(newTaskEst) || 1,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: newTaskSubtasks.map((titleText, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: titleText,
        completed: false,
        createdAt: new Date().toISOString(),
      })),
    };

    onTasksChange([created, ...tasks]);
    if (!activeTaskId) setActiveTaskId(created.id);
    setNewTaskTitle('');
    setNewTaskSubtasks([]);
    setDraftSubtaskText('');
    setExpandedTaskIds((prev) => ({ ...prev, [createdId]: true }));
    setShowAddTask(false);
  };

  // Calendar actions
  const handleCreateCalBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalTitle.trim()) return;
    playButtonTap();

    const hour = Number(newCalHour);
    const startStr = `${hour.toString().padStart(2, '0')}:00`;
    const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

    const newBlock: CalendarBlock = {
      id: `cal-${Date.now()}`,
      hour,
      time: `${startStr} - ${endStr}`,
      title: newCalTitle.trim(),
      category: 'Work',
      completed: false,
    };

    onCalendarChange([...calendar, newBlock].sort((a, b) => a.hour - b.hour));
    setNewCalTitle('');
    setShowAddCal(false);
  };

  const handleToggleCalBlock = (id: string) => {
    playButtonTap();
    onCalendarChange(
      calendar.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalDuration = MODE_DURATIONS[mode];
  const progressRatio = Math.max(0, Math.min(1, (totalDuration - timeLeft) / totalDuration));
  const strokeDashoffset = 283 - 283 * progressRatio;

  return (
    <div className="space-y-6">
      {/* Hero Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Blueprint 1 · Routine & Time Tracking Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Focus Pomodoro & Schedule Planner
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronized 25-min flow sessions paired with your active task backlog and daily calendar blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">Today's Focus</span>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {completedSessionsToday * 25} mins
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={handleSimulateFinish}
            title="Fast forward to end of session to preview the interstitial ad and earn +50 Pawcoins"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-xl border border-neutral-700/80 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Ad / Claim +50</span>
            <span className="sm:hidden">Test Ad</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Pomodoro Hero Clock, Right is Active Task Backlog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Clock & Active Focus */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-neutral-950/80 rounded-xl border border-neutral-800 w-full max-w-xs mb-6">
              <button
                onClick={() => switchMode('focus')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'focus'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => switchMode('shortBreak')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'shortBreak'
                    ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Short (5m)
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'longBreak'
                    ? 'bg-blue-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Long (15m)
              </button>
            </div>

            {/* Circular Clock Dial */}
            <div className="relative w-64 h-64 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-neutral-800/80 fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`fill-none transition-all duration-700 ease-linear ${
                    mode === 'focus'
                      ? 'stroke-amber-400'
                      : mode === 'shortBreak'
                      ? 'stroke-emerald-400'
                      : 'stroke-blue-400'
                  }`}
                  strokeWidth="4"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Central Clock Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-5xl font-black tracking-tight text-white tabular-nums drop-shadow-sm">
                  {timeFormatted}
                </span>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mt-1">
                  {mode === 'focus' ? 'Deep Focus Session' : 'Rest & Recharge'}
                </span>

                {/* Active Task Link with Color-coded category and priority styling */}
                {activeTask && (
                  <div
                    className={`mt-2 px-3 py-1 bg-neutral-950/85 border ${
                      TASK_CATEGORIES[activeTask.category]?.borderColor || 'border-neutral-800'
                    } rounded-full max-w-[240px] flex items-center gap-1.5 text-[11px] ${
                      TASK_CATEGORIES[activeTask.category]?.textColor || 'text-amber-300'
                    } shadow-sm backdrop-blur-sm`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        TASK_CATEGORIES[activeTask.category]?.dotColor || 'bg-amber-400'
                      }`}
                    />
                    <span className="truncate font-medium">{activeTask.title}</span>
                    <span className="text-[10px] opacity-75 shrink-0">· {activeTask.category}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        TASK_PRIORITIES[activeTask.priority || 'Medium'].badgeBg
                      } ${TASK_PRIORITIES[activeTask.priority || 'Medium'].textColor} ${
                        TASK_PRIORITIES[activeTask.priority || 'Medium'].borderColor
                      }`}
                    >
                      {TASK_PRIORITIES[activeTask.priority || 'Medium'].iconSymbol} {activeTask.priority || 'Medium'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="flex items-center gap-2 mt-4 text-xs text-neutral-400">
              <span className="text-[11px] text-neutral-500">Quick set:</span>
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleCustomDuration(mins)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    timeLeft === mins * 60
                      ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
                      : 'hover:bg-neutral-800/60 text-neutral-400'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={resetTimer}
                className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Reset Clock"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTimer}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all shadow-md ${
                  isRunning
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSimulateFinish}
                className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Complete & Claim Pawcoins"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Ambience Sound Status */}
            {onToggleAmbience && (
              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onToggleAmbience}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    ambiencePlaying
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-950/70 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                  }`}
                  title="Toggle background focus ambience sound"
                >
                  <Headphones className={`w-3.5 h-3.5 ${ambiencePlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                  <span>
                    Ambience: {ambienceType === 'white_noise' ? 'White Noise' : 'Forest Sounds'}{' '}
                    <strong>({ambiencePlaying ? 'Playing' : 'Off'})</strong>
                  </span>
                </button>
              </div>
            )}

            {/* Active Task Sub-tasks Sprint Checklist */}
            {activeTask && (
              <div className="mt-4 w-full bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 shadow-inner">
                <div className="flex items-center justify-between text-xs mb-2 pb-1.5 border-b border-neutral-800/60">
                  <div className="flex items-center gap-1.5 font-medium text-neutral-300">
                    <ListChecks className="w-3.5 h-3.5 text-amber-400" />
                    <span>Active Sprint Sub-tasks</span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400 font-semibold">
                    {(activeTask.subtasks || []).filter((s) => s.completed).length} /{' '}
                    {(activeTask.subtasks || []).length} done
                  </span>
                </div>

                {(activeTask.subtasks || []).length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(activeTask.subtasks || []).map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubTask(activeTask.id, st.id)}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/60 text-xs cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {st.completed ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 shrink-0" />
                          )}
                          <span
                            className={`truncate text-xs ${
                              st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic py-1">
                    No sub-tasks added to this active task yet. Add some in the task backlog to break down your focus sprint.
                  </p>
                )}
              </div>
            )}

            {/* Reward Ad Callout info */}
            <div className="mt-5 pt-4 border-t border-neutral-800/80 w-full flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Timer completion rewards +50 Pawcoins</span>
              </div>
              <span className="text-neutral-500 text-[11px]">Sponsored interstitial</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Task Backlog */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-white">Active Focus Backlog</h2>
                <p className="text-xs text-neutral-400">Click a task to bind it to your active Pomodoro timer</p>
              </div>
              <button
                onClick={() => {
                  playButtonTap();
                  setShowAddTask(!showAddTask);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Search Bar for filtering tasks by title, category, or priority */}
            <div className="pt-3 pb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tasks by title, category, or priority (High, Med, Low)..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                {taskSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      playButtonTap();
                      setTaskSearchQuery('');
                    }}
                    className="absolute right-2.5 p-0.5 text-neutral-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls: Categories & Priorities */}
            <div className="space-y-2 py-2.5 border-b border-neutral-800/60">
              {/* Category Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider flex items-center gap-1 pr-1 shrink-0">
                  <Tag className="w-3 h-3 text-neutral-400" />
                  <span>Category:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('All')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedCategoryFilter === 'All'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  All ({tasks.length})
                </button>

                {(Object.keys(TASK_CATEGORIES) as Task['category'][]).map((catKey) => {
                  const cat = TASK_CATEGORIES[catKey];
                  const count = tasks.filter((t) => t.category === catKey).length;
                  const isSelected = selectedCategoryFilter === catKey;

                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(catKey)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                        isSelected
                          ? `${cat.badgeBg} ${cat.textColor} ${cat.borderColor} border font-bold shadow-sm`
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`} />
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Priority Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-neutral-800/40">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider flex items-center gap-1 pr-1 shrink-0">
                  <Flag className="w-3 h-3 text-neutral-400" />
                  <span>Priority:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playButtonTap();
                    setSelectedPriorityFilter('All');
                  }}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedPriorityFilter === 'All'
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  All ({tasks.length})
                </button>
                {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => {
                  const cfg = TASK_PRIORITIES[p];
                  const isSelected = selectedPriorityFilter === p;
                  const count = tasks.filter((t) => (t.priority || 'Medium') === p).length;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        playButtonTap();
                        setSelectedPriorityFilter(p);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? `${cfg.badgeBg} ${cfg.textColor} ${cfg.borderColor} border font-bold shadow-sm ring-1 ring-white/10`
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                      <span>{cfg.iconSymbol} {p}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Task Form with Category and Priority Selectors */}
            {showAddTask && (
              <form onSubmit={handleCreateTask} className="p-4 my-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3.5 shadow-md">
                <input
                  type="text"
                  placeholder="What are you focusing on?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  autoFocus
                />

                {/* Tactile Category Color Chips */}
                <div>
                  <label className="text-[11px] text-neutral-400 block font-medium mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-neutral-400" />
                    <span>Assign Category</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(Object.keys(TASK_CATEGORIES) as Task['category'][]).map((catKey) => {
                      const cat = TASK_CATEGORIES[catKey];
                      const isSelected = newTaskCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setNewTaskCategory(catKey)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? `${cat.badgeBg} ${cat.textColor} ${cat.borderColor} ring-1 ring-white/20 font-bold shadow-sm`
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tactile Priority Level Selector */}
                <div>
                  <label className="text-[11px] text-neutral-400 block font-medium mb-1.5 flex items-center gap-1.5">
                    <Flag className="w-3 h-3 text-neutral-400" />
                    <span>Priority Level</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => {
                      const cfg = TASK_PRIORITIES[p];
                      const isSelected = newTaskPriority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            playButtonTap();
                            setNewTaskPriority(p);
                          }}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? `${cfg.badgeBg} ${cfg.textColor} ${cfg.borderColor} ring-1 ring-white/20 font-bold shadow-sm`
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                          <span>{cfg.iconSymbol} {p}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actionable Sub-tasks section */}
                <div className="pt-2 border-t border-neutral-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
                      <ListChecks className="w-3 h-3 text-neutral-400" />
                      <span>Sub-tasks / Action Items (Optional)</span>
                    </label>
                    {newTaskSubtasks.length > 0 && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        {newTaskSubtasks.length} sub-task{newTaskSubtasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {newTaskSubtasks.length > 0 && (
                    <div className="space-y-1 mb-2 max-h-24 overflow-y-auto pr-1">
                      {newTaskSubtasks.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800/80 text-xs text-neutral-200"
                        >
                          <span className="truncate">
                            <span className="text-neutral-500 font-mono mr-1.5">{idx + 1}.</span>
                            {st}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveDraftSubtask(idx, e)}
                            className="text-neutral-500 hover:text-rose-400 p-0.5 cursor-pointer"
                            title="Remove sub-task"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add an actionable sub-task..."
                      value={draftSubtaskText}
                      onChange={(e) => setDraftSubtaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDraftSubtask(e);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDraftSubtask}
                      disabled={!draftSubtaskText.trim()}
                      className="px-2.5 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span>Est. Pomodoros:</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newTaskEst}
                      onChange={(e) => setNewTaskEst(Number(e.target.value))}
                      className="w-14 px-2 py-1 text-xs bg-neutral-900 border border-neutral-800 rounded text-center text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg transition-colors cursor-pointer"
                    >
                      Save Task
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Task list rows */}
            <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
              {(() => {
                const normalizedQuery = taskSearchQuery.toLowerCase().trim();
                const visibleTasks = tasks.filter((t) => {
                  const matchesCategory =
                    selectedCategoryFilter === 'All' || t.category === selectedCategoryFilter;
                  const taskPriority = t.priority || 'Medium';
                  const matchesPriority =
                    selectedPriorityFilter === 'All' || taskPriority === selectedPriorityFilter;
                  const matchesSubtask = (t.subtasks || []).some((st) =>
                    st.title.toLowerCase().includes(normalizedQuery)
                  );
                  const matchesSearch =
                    !normalizedQuery ||
                    t.title.toLowerCase().includes(normalizedQuery) ||
                    t.category.toLowerCase().includes(normalizedQuery) ||
                    taskPriority.toLowerCase().includes(normalizedQuery) ||
                    matchesSubtask;
                  return matchesCategory && matchesPriority && matchesSearch;
                });

                if (visibleTasks.length === 0) {
                  return (
                    <div className="py-12 text-center text-neutral-500 text-xs space-y-2">
                      {taskSearchQuery ? (
                        <>
                          <p>
                            No tasks matching &quot;{taskSearchQuery}&quot;
                            {selectedCategoryFilter !== 'All' ? ` in ${selectedCategoryFilter}` : ''}
                            {selectedPriorityFilter !== 'All' ? ` with ${selectedPriorityFilter} priority` : ''}.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              playButtonTap();
                              setTaskSearchQuery('');
                              setSelectedCategoryFilter('All');
                              setSelectedPriorityFilter('All');
                            }}
                            className="text-amber-400 hover:underline text-[11px] font-medium"
                          >
                            Clear Search & Reset All Filters
                          </button>
                        </>
                      ) : selectedCategoryFilter !== 'All' || selectedPriorityFilter !== 'All' ? (
                        <>
                          <p>
                            No tasks matching the selected filters
                            {selectedCategoryFilter !== 'All' ? ` (${selectedCategoryFilter})` : ''}
                            {selectedPriorityFilter !== 'All' ? ` (${selectedPriorityFilter} priority)` : ''}.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              playButtonTap();
                              setSelectedCategoryFilter('All');
                              setSelectedPriorityFilter('All');
                            }}
                            className="text-amber-400 hover:underline text-[11px] font-medium"
                          >
                            Reset Filters
                          </button>
                        </>
                      ) : (
                        <p>No active tasks. Add one to start your synchronized focus session.</p>
                      )}
                    </div>
                  );
                }

                return visibleTasks.map((task) => {
                  const isActive = activeTaskId === task.id;
                  const catConfig = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.Work;
                  const priority = task.priority || 'Medium';
                  const priorityConfig = TASK_PRIORITIES[priority] || TASK_PRIORITIES.Medium;
                  const subtasks = task.subtasks || [];
                  const completedSubtasks = subtasks.filter((st) => st.completed).length;
                  const isExpanded = !!expandedTaskIds[task.id];

                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5 shadow-sm'
                          : 'border-neutral-800/80 bg-neutral-950/40 hover:border-neutral-700/80'
                      }`}
                    >
                      {/* Primary Task Header */}
                      <div
                        onClick={() => {
                          playButtonTap();
                          setActiveTaskId(isActive ? null : task.id);
                        }}
                        className="p-3 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Distinct colored indicator bars: Category Strip + Priority Pip */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div
                              className={`w-1 h-9 rounded-full ${catConfig.dotColor} opacity-80`}
                              title={`Category: ${task.category}`}
                            />
                            <div
                              className={`w-1.5 h-5 rounded-full ${priorityConfig.dotColor} shadow-sm`}
                              title={`Priority: ${priority}`}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTask(task.id);
                            }}
                            className="text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-500">
                              {/* Category Reassignment Dropdown Tag */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="relative inline-flex items-center"
                              >
                                <select
                                  value={task.category}
                                  onChange={(e) =>
                                    handleUpdateTaskCategory(task.id, e.target.value as Task['category'], e)
                                  }
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catConfig.badgeBg} ${catConfig.textColor} ${catConfig.borderColor} bg-neutral-900 cursor-pointer focus:outline-none transition-colors hover:border-white/30`}
                                  title="Click to reassign category"
                                >
                                  {(Object.keys(TASK_CATEGORIES) as Task['category'][]).map((catName) => (
                                    <option key={catName} value={catName} className="bg-neutral-900 text-white">
                                      {catName}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Priority Indicator & Selector */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="relative inline-flex items-center"
                              >
                                <select
                                  value={priority}
                                  onChange={(e) =>
                                    handleUpdateTaskPriority(task.id, e.target.value as TaskPriority, e)
                                  }
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityConfig.badgeBg} ${priorityConfig.textColor} ${priorityConfig.borderColor} bg-neutral-900 cursor-pointer focus:outline-none transition-all hover:brightness-125`}
                                  title="Click to change Priority Level (High, Medium, Low)"
                                >
                                  {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => (
                                    <option
                                      key={p}
                                      value={p}
                                      className={`bg-neutral-900 font-semibold ${
                                        p === 'High'
                                          ? 'text-rose-400'
                                          : p === 'Medium'
                                          ? 'text-amber-400'
                                          : 'text-emerald-400'
                                      }`}
                                    >
                                      {TASK_PRIORITIES[p].iconSymbol} {p}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Sub-tasks Expand Toggle Button */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleExpandTask(task.id, e)}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                                    : subtasks.length > 0
                                    ? completedSubtasks === subtasks.length
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                                    : 'bg-neutral-900/60 text-neutral-400 border-dashed border-neutral-800 hover:text-neutral-200'
                                }`}
                                title={
                                  subtasks.length > 0
                                    ? 'Click to toggle sub-tasks checklist'
                                    : 'Click to add sub-tasks to this project'
                                }
                              >
                                <ListChecks className="w-3 h-3 text-amber-400" />
                                <span>
                                  {subtasks.length > 0
                                    ? `${completedSubtasks}/${subtasks.length} sub-tasks`
                                    : '+ Sub-tasks'}
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-neutral-500" />
                                )}
                              </button>

                              {/* Sub-tasks mini progress bar */}
                              {subtasks.length > 0 && (
                                <div
                                  className="w-12 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 shrink-0"
                                  title={`${completedSubtasks} of ${subtasks.length} sub-tasks completed`}
                                >
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      completedSubtasks === subtasks.length
                                        ? 'bg-emerald-400'
                                        : 'bg-amber-400'
                                    }`}
                                    style={{
                                      width: `${(completedSubtasks / subtasks.length) * 100}%`,
                                    }}
                                  />
                                </div>
                              )}

                              <span>·</span>
                              <span className="font-mono tabular-nums text-neutral-400">
                                {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isActive && (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              Active
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleToggleExpandTask(task.id, e)}
                            className="p-1 text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse sub-tasks' : 'Expand sub-tasks'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Sub-tasks Drawer */}
                      {isExpanded && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="border-t border-neutral-800/80 bg-neutral-950/70 p-3 pt-2.5 rounded-b-xl space-y-2.5 cursor-default"
                        >
                          {/* Subtask Drawer Header & Progress summary */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <ListChecks className="w-3.5 h-3.5 text-amber-400" />
                              <span className="font-semibold text-neutral-300">Actionable Sub-tasks</span>
                              <span className="font-mono text-[10px] text-neutral-500">
                                ({completedSubtasks}/{subtasks.length} completed)
                              </span>
                            </div>
                            {subtasks.length > 0 && (
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {Math.round((completedSubtasks / subtasks.length) * 100)}% done
                              </span>
                            )}
                          </div>

                          {/* Progress Bar inside drawer */}
                          {subtasks.length > 0 && (
                            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  completedSubtasks === subtasks.length ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                                style={{
                                  width: `${(completedSubtasks / subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          )}

                          {/* Subtasks items checklist */}
                          {subtasks.length > 0 ? (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  className={`group flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                                    st.completed
                                      ? 'bg-neutral-900/40 border-neutral-800/50 text-neutral-500'
                                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleSubTask(task.id, st.id, e)}
                                    className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer flex-1"
                                  >
                                    {st.completed ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0 transition-colors" />
                                    )}
                                    <span
                                      className={`text-xs select-none truncate ${
                                        st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteSubTask(task.id, st.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity cursor-pointer shrink-0"
                                    title="Delete sub-task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-500 italic py-1">
                              No sub-tasks yet. Break down this task into smaller actionable steps below.
                            </p>
                          )}

                          {/* Inline quick-add form */}
                          <form
                            onSubmit={(e) => handleAddSubTask(task.id, e)}
                            className="flex items-center gap-2 pt-1"
                          >
                            <div className="relative flex-1">
                              <input
                                type="text"
                                placeholder="Add sub-task (e.g. Verify budget numbers)..."
                                value={inlineSubtaskInputs[task.id] || ''}
                                onChange={(e) =>
                                  setInlineSubtaskInputs((prev) => ({
                                    ...prev,
                                    [task.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/70 transition-colors"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={!(inlineSubtaskInputs[task.id] || '').trim()}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-amber-500/30 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Calendar / Time Blocking Schedule */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Daily Time-Blocking Schedule</h2>
              <p className="text-xs text-neutral-400">Structured hourly day blocks synchronized with focus intervals</p>
            </div>
          </div>

          <button
            onClick={() => {
              playButtonTap();
              setShowAddCal(!showAddCal);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700/80"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Time Block</span>
          </button>
        </div>

        {/* Add Block Form */}
        {showAddCal && (
          <form onSubmit={handleCreateCalBlock} className="p-3 my-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Block agenda (e.g., Deep Work Sprint)"
              value={newCalTitle}
              onChange={(e) => setNewCalTitle(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Start Hour:</span>
              <select
                value={newCalHour}
                onChange={(e) => setNewCalHour(Number(e.target.value))}
                className="px-2 py-1 text-xs bg-neutral-900 border border-neutral-800 rounded text-neutral-200"
              >
                {Array.from({ length: 14 }).map((_, i) => {
                  const h = i + 8; // 8:00 to 21:00
                  return (
                    <option key={h} value={h}>
                      {h}:00
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg"
            >
              Add Block
            </button>
          </form>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {calendar.map((block) => (
            <div
              key={block.id}
              onClick={() => handleToggleCalBlock(block.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                block.completed
                  ? 'border-neutral-800 bg-neutral-950/40 opacity-70'
                  : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-mono text-amber-400/90 font-medium">
                  {block.time}
                </span>
                {(() => {
                  const calCat = TASK_CATEGORIES[block.category as Task['category']] || {
                    badgeBg: 'bg-neutral-900',
                    textColor: 'text-neutral-400',
                    borderColor: 'border-neutral-800',
                    dotColor: 'bg-neutral-400',
                  };
                  return (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${calCat.badgeBg} ${calCat.textColor} ${calCat.borderColor} flex items-center gap-1`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${calCat.dotColor}`} />
                      <span>{block.category}</span>
                    </span>
                  );
                })()}
              </div>
              <h4 className={`text-xs font-semibold mt-2 ${block.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                {block.title}
              </h4>
              <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500">
                <span>{block.completed ? 'Completed' : 'Upcoming'}</span>
                <span className="text-[10px] text-neutral-600">Click to toggle</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
