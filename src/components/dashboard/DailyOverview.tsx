import React, { useState, useEffect } from 'react';
import { Task, ExpenseItem, WaterLog, DailyGoals } from '../../types';
import {
  Clock,
  Coins,
  Droplets,
  ChevronRight,
  Sparkles,
  Flame,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  Quote,
  RotateCw,
  TrendingUp,
  BarChart2,
  Activity,
  Target,
  Sliders,
  Settings2,
  Check,
  X,
  Pencil,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { playButtonTap, playCoinSound } from '../../utils/audio';
import { storage, DEFAULT_DAILY_GOALS } from '../../utils/storage';

interface DailyOverviewProps {
  tasks: Task[];
  expenses: ExpenseItem[];
  water: WaterLog[];
  dailyBudget?: number;
  waterTargetMl?: number;
  pomodoroTarget?: number;
  initialGoals?: Partial<DailyGoals>;
  onNavigate: (view: 'pomodoro' | 'financial' | 'vitals') => void;
  onQuickAddWater: (ml: number) => void;
  onGoalsChange?: (goals: DailyGoals) => void;
}

const INSPIRING_QUOTES = [
  {
    quote: "Small daily disciplines, repeated day in and day out, compound into extraordinary vitality and mastery.",
    author: "Daily Habit Craft",
    tag: "Momentum",
  },
  {
    quote: "Focus is not about doing everything; it is about bringing calm, complete presence to what matters right now.",
    author: "Deep Flow",
    tag: "Clarity",
  },
  {
    quote: "Energy flows where mindful attention goes. Guard your hours, nourish your body, and spend with purpose.",
    author: "Mindful Health",
    tag: "Balance",
  },
  {
    quote: "You don't need endless time—you just need intense, peaceful focus for 25 minutes at a time.",
    author: "Routine Mastery",
    tag: "Focus",
  },
  {
    quote: "Every glass of water, every logged milestone, and every completed focus block creates your future self.",
    author: "Vitality Code",
    tag: "Progress",
  },
  {
    quote: "Quiet consistency is your greatest superpower. Show up today with intention and let momentum build.",
    author: "Daily Pulse",
    tag: "Consistency",
  },
];

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  tasks,
  expenses,
  water,
  dailyBudget = 120,
  waterTargetMl = 2500,
  pomodoroTarget = 6,
  initialGoals,
  onNavigate,
  onQuickAddWater,
  onGoalsChange,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Custom Daily Goals State (persisted in localStorage)
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>(() => {
    const stored = storage.getDailyGoals();
    return {
      taskGoal: initialGoals?.taskGoal ?? stored.taskGoal ?? DEFAULT_DAILY_GOALS.taskGoal,
      spendingLimit: initialGoals?.spendingLimit ?? (dailyBudget !== 120 && dailyBudget !== undefined ? dailyBudget : (stored.spendingLimit ?? DEFAULT_DAILY_GOALS.spendingLimit)),
      waterTargetMl: initialGoals?.waterTargetMl ?? (waterTargetMl !== 2500 && waterTargetMl !== undefined ? waterTargetMl : (stored.waterTargetMl ?? DEFAULT_DAILY_GOALS.waterTargetMl)),
    };
  });

  // Modal / Custom Goals Editing State
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [tempTaskGoal, setTempTaskGoal] = useState<number>(dailyGoals.taskGoal);
  const [tempSpendingLimit, setTempSpendingLimit] = useState<number>(dailyGoals.spendingLimit);
  const [tempWaterGoal, setTempWaterGoal] = useState<number>(dailyGoals.waterTargetMl);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Daily Affirmation State & Animation Trigger
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const day = new Date().getDate();
    return day % INSPIRING_QUOTES.length;
  });
  const [isAffirmationAnimating, setIsAffirmationAnimating] = useState(false);

  // Trigger gentle breathing/glow animation on mount
  useEffect(() => {
    setIsAffirmationAnimating(true);
    const timer = setTimeout(() => {
      setIsAffirmationAnimating(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    playButtonTap();
    setIsAffirmationAnimating(true);
    setQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
    setTimeout(() => setIsAffirmationAnimating(false), 800);
  };

  // Open Goals Modal and sync temp state
  const handleOpenGoalsModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playButtonTap();
    setTempTaskGoal(dailyGoals.taskGoal);
    setTempSpendingLimit(dailyGoals.spendingLimit);
    setTempWaterGoal(dailyGoals.waterTargetMl);
    setIsGoalsModalOpen(true);
  };

  const handleCloseGoalsModal = () => {
    playButtonTap();
    setIsGoalsModalOpen(false);
  };

  // Save Custom Goals Handler
  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    playCoinSound();
    const updated: DailyGoals = {
      taskGoal: Math.max(1, Math.min(50, Math.round(Number(tempTaskGoal) || DEFAULT_DAILY_GOALS.taskGoal))),
      spendingLimit: Math.max(5, Math.min(50000, Math.round((Number(tempSpendingLimit) || DEFAULT_DAILY_GOALS.spendingLimit) * 100) / 100)),
      waterTargetMl: Math.max(250, Math.min(10000, Math.round(Number(tempWaterGoal) || DEFAULT_DAILY_GOALS.waterTargetMl))),
    };

    setDailyGoals(updated);
    storage.setDailyGoals(updated);
    if (onGoalsChange) {
      onGoalsChange(updated);
    }

    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      setIsGoalsModalOpen(false);
    }, 600);
  };

  // Reset Custom Goals to Default Preset
  const handleResetDefaults = () => {
    playButtonTap();
    setTempTaskGoal(DEFAULT_DAILY_GOALS.taskGoal);
    setTempSpendingLimit(DEFAULT_DAILY_GOALS.spendingLimit);
    setTempWaterGoal(DEFAULT_DAILY_GOALS.waterTargetMl);
  };

  // ==========================================
  // PROGRESS PERCENTAGE & METRICS COMPUTATIONS
  // ==========================================

  // 1. Tasks Completed Progress
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskPercent = Math.min(100, Math.round((completedTasksCount / dailyGoals.taskGoal) * 100));
  const completedPomodoros = tasks.reduce((sum, t) => sum + t.completedPomodoros, 0);
  const targetPomodoros = Math.max(pomodoroTarget, tasks.reduce((sum, t) => sum + t.estimatedPomodoros, 0) || pomodoroTarget);
  const pomodoroPercent = Math.min(100, Math.round((completedPomodoros / targetPomodoros) * 100));

  // 2. Spending Limit Progress
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const totalSpentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expensePercent = Math.round((totalSpentToday / dailyGoals.spendingLimit) * 100);
  const remainingBudget = Math.max(0, dailyGoals.spendingLimit - totalSpentToday);
  const isBudgetExceeded = totalSpentToday > dailyGoals.spendingLimit;

  // 3. Water Intake Progress
  const totalWater = water.reduce((sum, w) => sum + w.amountMl, 0);
  const waterPercent = Math.min(100, Math.round((totalWater / dailyGoals.waterTargetMl) * 100));
  const remainingWater = Math.max(0, dailyGoals.waterTargetMl - totalWater);

  // Overall Daily Score / Index (Average of Tasks, Budget discipline, Hydration)
  const budgetDisciplineScore = totalSpentToday <= dailyGoals.spendingLimit
    ? 100
    : Math.max(0, 100 - (totalSpentToday - dailyGoals.spendingLimit) * 2);
  const aggregateScore = Math.round((taskPercent + waterPercent + budgetDisciplineScore) / 3);

  // 7-Day Visual Progress Chart State
  const [activeChartTab, setActiveChartTab] = useState<'water' | 'expenses'>('water');

  // Compute 7-day trend history combining actual logs and background seed
  const last7DaysData = React.useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;

      // Actual logged expenses on this date
      const dayExpenses = expenses.filter((e) => e.date === dateStr);
      const actualExp = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Actual logged water if today
      const actualWater = isToday
        ? water.reduce((sum, w) => sum + w.amountMl, 0)
        : 0;

      // Realistic historical baseline
      const fallbackWater = [2100, 2400, 2650, 1950, 2500, 2350, 1850][(7 - i) % 7];
      const fallbackExp = [45.2, 88.5, 32.0, 115.4, 64.0, 92.8, 14.5][(7 - i) % 7];

      const dayLabel = isToday
        ? 'Today'
        : d.toLocaleDateString('en-US', { weekday: 'short' });

      data.push({
        date: dateStr,
        day: dayLabel,
        waterMl: isToday && actualWater > 0 ? actualWater : (actualWater || fallbackWater),
        waterGoal: dailyGoals.waterTargetMl,
        expenseAmount: actualExp > 0 ? Math.round(actualExp * 100) / 100 : fallbackExp,
        budgetGoal: dailyGoals.spendingLimit,
      });
    }

    return data;
  }, [water, expenses, dailyGoals.waterTargetMl, dailyGoals.spendingLimit]);

  // Format today's date for Android header
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="w-full mb-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Android-style Material Header bar */}
      <div className="px-4 sm:px-5 py-3.5 bg-neutral-950/70 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">Daily Overview</span>
              <span className="text-[10px] text-neutral-400 font-medium bg-neutral-800/80 px-2 py-0.5 rounded-full border border-neutral-700/60">
                {todayFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Set Daily Goals Action Button & Aggregate Score */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenGoalsModal}
            className="group flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 active:scale-95 transition-all text-xs font-semibold cursor-pointer shadow-sm shadow-amber-500/5"
            title="Set custom daily goals for tasks, spending, and water"
          >
            <Target className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span>Set Daily Goals</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
          </button>

          {/* Aggregate Milestone Gauge */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block leading-none font-medium">Daily Score</span>
              <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums leading-tight">
                {aggregateScore}%
              </span>
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700"
                  strokeDasharray={`${aggregateScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Affirmation Card with Gentle Breathing/Entrance Animation */}
      <div className="px-4 sm:px-5 pt-4 pb-1">
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-700 p-3.5 sm:p-4 ${
            isAffirmationAnimating
              ? 'bg-gradient-to-r from-amber-500/15 via-neutral-900 to-rose-500/15 border-amber-500/40 shadow-lg shadow-amber-500/5 scale-[1.005]'
              : 'bg-gradient-to-r from-amber-500/5 via-neutral-950/80 to-rose-500/5 border-neutral-800/90'
          }`}
        >
          {/* Subtle Ambient Shimmer Ribbon */}
          <div
            className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent transition-opacity duration-1000 ${
              isAffirmationAnimating ? 'opacity-100' : 'opacity-30'
            }`}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 transition-transform duration-700 ${
                  isAffirmationAnimating ? 'scale-110 rotate-6' : 'scale-100'
                }`}
              >
                <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400/30" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Daily Affirmation
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-[10px] text-neutral-400 font-medium bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                    {INSPIRING_QUOTES[quoteIndex].tag}
                  </span>
                </div>

                <p
                  className={`text-xs sm:text-sm font-medium italic leading-relaxed transition-colors duration-500 ${
                    isAffirmationAnimating ? 'text-white' : 'text-neutral-200'
                  }`}
                >
                  &ldquo;{INSPIRING_QUOTES[quoteIndex].quote}&rdquo;
                </p>

                <span className="text-[10px] sm:text-[11px] text-neutral-500 block mt-1 font-normal">
                  — {INSPIRING_QUOTES[quoteIndex].author}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextQuote}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/80 active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Next Inspiring Quote"
            >
              <RotateCw
                className={`w-3.5 h-3.5 transition-transform duration-500 ${
                  isAffirmationAnimating ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Custom Daily Goal Metric Cards Grid with Android Touch Ergonomics */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* ======================================================== */}
        {/* Metric Target 1: Tasks Completed (Custom Goal & Progress) */}
        {/* ======================================================== */}
        <div
          onClick={() => {
            playButtonTap();
            onNavigate('pomodoro');
          }}
          className="group relative p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/90 hover:border-amber-500/40 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      Tasks Completed
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenGoalsModal}
                      className="p-1 text-neutral-500 hover:text-amber-400 transition-colors rounded"
                      title="Adjust Daily Task Goal"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {completedTasksCount} / {dailyGoals.taskGoal}{' '}
                    <span className="text-xs font-normal text-neutral-400">tasks</span>
                  </span>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  taskPercent >= 100
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {taskPercent}%
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 transition-colors shrink-0" />
              </div>
            </div>

            {/* Android Pill Progress Bar for Task Goal */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span className="text-neutral-400">
                  {completedTasksCount >= dailyGoals.taskGoal
                    ? 'Target achieved!'
                    : `${dailyGoals.taskGoal - completedTasksCount} more task${dailyGoals.taskGoal - completedTasksCount === 1 ? '' : 's'} to goal`}
                </span>
                <span className="text-amber-400 font-semibold">{taskPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    taskPercent >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${taskPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500">
            <span>{completedPomodoros} focus blocks logged</span>
            <span className="text-amber-400 font-medium">Goal: {dailyGoals.taskGoal} tasks</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Metric Target 2: Spending Limit (Custom Goal & Progress)  */}
        {/* ======================================================== */}
        <div
          onClick={() => {
            playButtonTap();
            onNavigate('financial');
          }}
          className="group relative p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/90 hover:border-emerald-500/40 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isBudgetExceeded
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      Spending Limit
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenGoalsModal}
                      className="p-1 text-neutral-500 hover:text-emerald-400 transition-colors rounded"
                      title="Adjust Spending Limit"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    ${totalSpentToday.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-neutral-400">/ ${dailyGoals.spendingLimit.toFixed(0)}</span>
                  </span>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  isBudgetExceeded
                    ? 'bg-red-500/15 text-red-300 border-red-500/30'
                    : expensePercent > 80
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {expensePercent}%
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-emerald-400 transition-colors shrink-0" />
              </div>
            </div>

            {/* Android Pill Progress Bar for Spending Limit */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span className={remainingBudget > 0 ? 'text-neutral-400' : 'text-red-400'}>
                  {remainingBudget > 0 ? `$${remainingBudget.toFixed(2)} left` : `Exceeded by $${(totalSpentToday - dailyGoals.spendingLimit).toFixed(2)}`}
                </span>
                <span className={`font-semibold ${isBudgetExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                  {expensePercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBudgetExceeded
                      ? 'bg-red-500'
                      : expensePercent > 80
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, expensePercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500">
            <span>{todayExpenses.length} entries today</span>
            <span className="text-emerald-400 font-medium">Limit: ${dailyGoals.spendingLimit}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Metric Target 3: Water Intake (Custom Goal & Progress)    */}
        {/* ======================================================== */}
        <div
          onClick={() => {
            playButtonTap();
            onNavigate('vitals');
          }}
          className="group relative p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/90 hover:border-blue-500/40 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      Water Intake
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenGoalsModal}
                      className="p-1 text-neutral-500 hover:text-blue-400 transition-colors rounded"
                      title="Adjust Hydration Target"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {totalWater}{' '}
                    <span className="text-xs font-normal text-neutral-400">/ {dailyGoals.waterTargetMl} mL</span>
                  </span>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  waterPercent >= 100
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}>
                  {waterPercent}%
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors shrink-0" />
              </div>
            </div>

            {/* Android Pill Progress Bar for Water Goal */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span className="text-neutral-400">
                  {remainingWater > 0 ? `${remainingWater} mL remaining` : 'Hydration goal met! 💧'}
                </span>
                <span className="text-blue-400 font-semibold">{waterPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick-Action Chips for Android Touch (Min 44px touch height) */}
          <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center justify-between gap-2">
            <span className="text-[10px] text-neutral-500">Quick Log:</span>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  playCoinSound();
                  onQuickAddWater(250);
                }}
                className="min-h-[32px] px-2.5 py-1 text-[11px] font-bold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 active:bg-blue-500/35 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                title="Add 250ml glass"
              >
                <Plus className="w-3 h-3" />
                <span>250ml</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playCoinSound();
                  onQuickAddWater(500);
                }}
                className="min-h-[32px] px-2.5 py-1 text-[11px] font-bold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 active:bg-blue-500/35 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                title="Add 500ml bottle"
              >
                <Plus className="w-3 h-3" />
                <span>500ml</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 'Daily Progress' Visual Chart Section using Recharts */}
      <div className="px-4 sm:px-5 pb-5 pt-1">
        <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-3">
          {/* Header with Segmented View Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-cyan-400">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Daily Progress · 7-Day Velocity</span>
                </h3>
                <span className="text-[10px] text-neutral-400">
                  {activeChartTab === 'water'
                    ? `Hydration volume vs. ${dailyGoals.waterTargetMl.toLocaleString()} mL daily target`
                    : `Daily spending vs. $${dailyGoals.spendingLimit.toFixed(2)} daily limit`}
                </span>
              </div>
            </div>

            {/* Segmented Control */}
            <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-neutral-800/80 text-[11px] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  playButtonTap();
                  setActiveChartTab('water');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeChartTab === 'water'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Water vs Goal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playButtonTap();
                  setActiveChartTab('expenses');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeChartTab === 'expenses'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Coins className="w-3 h-3 text-emerald-400" />
                <span>Expense Trends</span>
              </button>
            </div>
          </div>

          {/* Recharts Visual Container */}
          <div className="h-48 sm:h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'water' ? (
                <AreaChart data={last7DaysData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#737373"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#262626' }}
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                    domain={[0, Math.max(3000, dailyGoals.waterTargetMl + 500)]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-xl shadow-xl text-xs space-y-1">
                            <span className="font-semibold text-white block">{d.day} ({d.date})</span>
                            <div className="flex items-center gap-2 text-cyan-400 font-mono">
                              <span>Intake: {d.waterMl} mL</span>
                              <span className="text-[10px] text-neutral-400">
                                ({Math.round((d.waterMl / d.waterGoal) * 100)}% of goal)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={dailyGoals.waterTargetMl}
                    stroke="#06b6d4"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Target: ${dailyGoals.waterTargetMl}mL`,
                      position: 'top',
                      fill: '#06b6d4',
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="waterMl"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#waterAreaGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={last7DaysData} margin={{ top: 12, right: 12, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#737373"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#262626' }}
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                    domain={[0, Math.max(160, dailyGoals.spendingLimit + 40)]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        const isOver = d.expenseAmount > d.budgetGoal;
                        return (
                          <div className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-xl shadow-xl text-xs space-y-1">
                            <span className="font-semibold text-white block">{d.day} ({d.date})</span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className={isOver ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                Spent: ${d.expenseAmount.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {isOver ? '(Exceeded limit)' : '(Within limit)'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={dailyGoals.spendingLimit}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Limit: $${dailyGoals.spendingLimit}`,
                      position: 'top',
                      fill: '#ef4444',
                      fontSize: 10,
                    }}
                  />
                  <Bar
                    dataKey="expenseAmount"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick Summary Pill Strip at bottom of chart */}
          <div className="pt-2 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
            {activeChartTab === 'water' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>7-Day Average: <strong className="text-white font-mono">{Math.round(last7DaysData.reduce((s, d) => s + d.waterMl, 0) / 7)} mL/day</strong></span>
                </div>
                <span className="text-emerald-400 font-medium">
                  ✓ {last7DaysData.filter((d) => d.waterMl >= d.waterGoal).length}/7 days reached goal
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>7-Day Total: <strong className="text-white font-mono">${last7DaysData.reduce((s, d) => s + d.expenseAmount, 0).toFixed(2)}</strong></span>
                </div>
                <span className="text-emerald-400 font-medium">
                  ✓ {last7DaysData.filter((d) => d.expenseAmount <= d.budgetGoal).length}/7 days under limit
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CUSTOM DAILY GOALS SETTINGS MODAL / BOTTOM SHEET DIALOG  */}
      {/* ======================================================== */}
      {isGoalsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCloseGoalsModal}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Set Custom Daily Goals</h3>
                  <p className="text-[11px] text-neutral-400">Configure your daily targets & progress milestones</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseGoalsModal}
                className="w-8 h-8 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveGoals} className="p-5 overflow-y-auto space-y-5">
              {/* Goal 1: Tasks Completed Target */}
              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Daily Tasks Completed Target</span>
                  </div>
                  {/* Live Progress Preview */}
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {Math.min(100, Math.round((completedTasksCount / Math.max(1, tempTaskGoal)) * 100))}% live
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400">
                  How many primary tasks you aim to check off today (Currently completed: <strong className="text-white font-mono">{completedTasksCount}</strong>).
                </p>

                {/* Input with Stepper Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playButtonTap();
                      setTempTaskGoal((prev) => Math.max(1, prev - 1));
                    }}
                    className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 flex items-center justify-center text-base font-bold transition-colors active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={tempTaskGoal}
                      onChange={(e) => setTempTaskGoal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-2 px-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-neutral-500 pointer-events-none">tasks</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playButtonTap();
                      setTempTaskGoal((prev) => Math.min(50, prev + 1));
                    }}
                    className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 flex items-center justify-center text-base font-bold transition-colors active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-neutral-500">Presets:</span>
                  {[2, 3, 4, 5, 8].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        playButtonTap();
                        setTempTaskGoal(val);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                        tempTaskGoal === val
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {val} tasks
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal 2: Spending Limit Target */}
              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Daily Spending Limit ($ USD)</span>
                  </div>
                  {/* Live Progress Preview */}
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    totalSpentToday > tempSpendingLimit
                      ? 'bg-red-500/15 text-red-300 border-red-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}>
                    {Math.round((totalSpentToday / Math.max(1, tempSpendingLimit)) * 100)}% used
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Maximum daily budget cap before warnings trigger (Today spent: <strong className="text-white font-mono">${totalSpentToday.toFixed(2)}</strong>).
                </p>

                {/* Input for Spending Limit */}
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-500 font-mono font-bold">$</span>
                  <input
                    type="number"
                    min="5"
                    max="10000"
                    step="5"
                    value={tempSpendingLimit}
                    onChange={(e) => setTempSpendingLimit(Math.max(5, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-12 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-neutral-500 pointer-events-none">USD</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-neutral-500">Presets:</span>
                  {[50, 80, 120, 150, 200, 300].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        playButtonTap();
                        setTempSpendingLimit(val);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                        tempSpendingLimit === val
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal 3: Water Intake Target */}
              <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Daily Water Intake Target (mL)</span>
                  </div>
                  {/* Live Progress Preview */}
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {Math.min(100, Math.round((totalWater / Math.max(1, tempWaterGoal)) * 100))}% live
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Target daily hydration volume (Today logged: <strong className="text-white font-mono">{totalWater} mL</strong>).
                </p>

                {/* Input for Water Intake */}
                <div className="relative">
                  <input
                    type="number"
                    min="250"
                    max="8000"
                    step="250"
                    value={tempWaterGoal}
                    onChange={(e) => setTempWaterGoal(Math.max(250, parseInt(e.target.value) || 250))}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-neutral-500 pointer-events-none">mL / day</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-neutral-500">Presets:</span>
                  {[1500, 2000, 2500, 3000, 3500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        playButtonTap();
                        setTempWaterGoal(val);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                        tempWaterGoal === val
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {val.toLocaleString()} mL
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Reset Defaults
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseGoalsModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                  >
                    {saveSuccessNotice ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Daily Goals</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
