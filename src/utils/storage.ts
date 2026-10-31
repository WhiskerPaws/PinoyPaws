import { Task, CalendarBlock, ExpenseItem, WaterLog, WeightRecord, SugarRecord, FoodItem, PawcoinWallet, DailyGoals } from '../types';

const STORAGE_KEYS = {
  TASKS: 'pawpulse_tasks_v1',
  CALENDAR: 'pawpulse_calendar_v1',
  EXPENSES: 'pawpulse_expenses_v1',
  WATER: 'pawpulse_water_v1',
  WEIGHT: 'pawpulse_weight_v1',
  SUGAR: 'pawpulse_sugar_v1',
  FOOD: 'pawpulse_food_v1',
  WALLET: 'pawpulse_wallet_v1',
  ANALYTICS_UNLOCKED: 'pawpulse_analytics_unlocked_until_v1',
  DAILY_GOALS: 'pawpulse_daily_goals_v1',
};

export const DEFAULT_DAILY_GOALS: DailyGoals = {
  taskGoal: 4,
  spendingLimit: 120,
  waterTargetMl: 2500,
};

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Quarter Financial Audit & Review',
    category: 'Work',
    priority: 'High',
    estimatedPomodoros: 4,
    completedPomodoros: 2,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-1-1', title: 'Export Q3 ledger spreadsheets & reconcile payroll', completed: true },
      { id: 'sub-1-2', title: 'Review SaaS server & tooling invoices', completed: true },
      { id: 'sub-1-3', title: 'Prepare variance report and margin breakdown', completed: false },
      { id: 'sub-1-4', title: 'Share executive summary with stakeholders', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Deep Research: Architecture Specs & Diagram',
    category: 'Study',
    priority: 'Medium',
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-2-1', title: 'Benchmark WebSocket throughput vs SSE', completed: true },
      { id: 'sub-2-2', title: 'Draft ERD diagram for offline-first syncing', completed: false },
      { id: 'sub-2-3', title: 'Document JWT renewal & rate limit policy', completed: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Evening 5km Jog & Mobility Routine',
    category: 'Health',
    priority: 'Low',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    completed: true,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-3-1', title: '5-min dynamic hamstring & hip flexor warm-up', completed: true },
      { id: 'sub-3-2', title: '5km cadence pace jog', completed: true },
      { id: 'sub-3-3', title: 'Cool down & foam rolling stretch', completed: true },
    ],
  },
  {
    id: 'task-4',
    title: 'Sketch UI layout wireframes for mobile',
    category: 'Creative',
    priority: 'High',
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-4-1', title: 'Bottom navigation drawer & tab switcher', completed: false },
      { id: 'sub-4-2', title: 'Checklist checklist UI for sub-task items', completed: false },
      { id: 'sub-4-3', title: 'Dark mode tactile contrast tokens', completed: false },
    ],
  },
];

const INITIAL_CALENDAR: CalendarBlock[] = [
  { id: 'cal-1', hour: 8, time: '08:00 - 09:00', title: 'Morning Hydration & Journaling', category: 'Health', completed: true },
  { id: 'cal-2', hour: 9, time: '09:00 - 11:00', title: 'Deep Work: Quarter Financial Audit', category: 'Work', taskId: 'task-1', completed: true },
  { id: 'cal-3', hour: 11, time: '11:00 - 12:30', title: 'Research & Systems Planning', category: 'Study', taskId: 'task-2', completed: false },
  { id: 'cal-4', hour: 13, time: '13:00 - 14:00', title: 'Nutritious Lunch & Walk', category: 'Rest', completed: false },
  { id: 'cal-5', hour: 14, time: '14:00 - 16:00', title: 'Creative Wireframing & Prototyping', category: 'Creative', taskId: 'task-4', completed: false },
  { id: 'cal-6', hour: 17, time: '17:00 - 18:00', title: 'Cardio & Mobility Workout', category: 'Health', taskId: 'task-3', completed: false },
];

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    amount: 14.50,
    category: 'Food & Dining',
    description: 'Espresso & Avocado Sourdough Toast',
    date: getTodayDateStr(),
    time: '08:45',
    paymentMethod: 'Card',
  },
  {
    id: 'exp-2',
    amount: 32.80,
    category: 'Groceries',
    description: 'Fresh Greek yogurt, blueberries & walnuts',
    date: getTodayDateStr(),
    time: '12:15',
    paymentMethod: 'Digital Wallet',
  },
  {
    id: 'exp-3',
    amount: 4.25,
    category: 'Transport',
    description: 'Subway metro pass to co-working hub',
    date: getTodayDateStr(),
    time: '09:10',
    paymentMethod: 'Card',
  },
  {
    id: 'exp-4',
    amount: 89.00,
    category: 'Tools & Tech',
    description: 'Cloud Server & Dev hosting subscription',
    date: getTodayDateStr(),
    time: '14:20',
    paymentMethod: 'Card',
  },
];

const INITIAL_WATER: WaterLog[] = [
  { id: 'w-1', amountMl: 500, timestamp: '08:15' },
  { id: 'w-2', amountMl: 350, timestamp: '10:30' },
  { id: 'w-3', amountMl: 500, timestamp: '12:45' },
];

const INITIAL_WEIGHT: WeightRecord[] = [
  { id: 'wt-1', date: '2026-10-24', weightKg: 71.4, heightCm: 178, bmi: 22.5, notes: 'Post morning cardio' },
  { id: 'wt-2', date: '2026-10-27', weightKg: 71.0, heightCm: 178, bmi: 22.4, notes: 'Steady progress' },
  { id: 'wt-3', date: getTodayDateStr(), weightKg: 70.8, heightCm: 178, bmi: 22.3, notes: 'Hydrated & energetic' },
];

const INITIAL_SUGAR: SugarRecord[] = [
  { id: 'sg-1', date: getTodayDateStr(), time: '07:30', valueMgDl: 92, timing: 'Fasting', notes: 'Optimal baseline' },
  { id: 'sg-2', date: getTodayDateStr(), time: '13:45', valueMgDl: 124, timing: 'Post-Meal (2h)', notes: 'Healthy spike after quinoa bowl' },
];

const INITIAL_FOOD: FoodItem[] = [
  {
    id: 'fd-1',
    meal: 'Breakfast',
    name: 'Steel cut oatmeal with berries & whey protein',
    calories: 420,
    proteinG: 32,
    carbsG: 54,
    fatG: 8,
    date: getTodayDateStr(),
  },
  {
    id: 'fd-2',
    meal: 'Lunch',
    name: 'Grilled Salmon fillet with roasted sweet potatoes and asparagus',
    calories: 650,
    proteinG: 46,
    carbsG: 48,
    fatG: 22,
    date: getTodayDateStr(),
  },
  {
    id: 'fd-3',
    meal: 'Snacks',
    name: 'Raw almonds & green apple',
    calories: 190,
    proteinG: 6,
    carbsG: 22,
    fatG: 11,
    date: getTodayDateStr(),
  },
];

const INITIAL_WALLET: PawcoinWallet = {
  balance: 150,
  totalEarned: 350,
  streakDays: 4,
  unlockedPerks: ['sound_zen_bell'],
};

export const loadStored = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const saveStored = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save error', e);
  }
};

export const storage = {
  getTasks: (): Task[] => {
    const loaded = loadStored<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    return loaded.map((t) => {
      if (!t.subtasks) {
        const foundInitial = INITIAL_TASKS.find((init) => init.id === t.id);
        return {
          ...t,
          subtasks: foundInitial?.subtasks ? [...foundInitial.subtasks] : [],
        };
      }
      return t;
    });
  },
  setTasks: (tasks: Task[]) => saveStored(STORAGE_KEYS.TASKS, tasks),

  getCalendar: () => loadStored<CalendarBlock[]>(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR),
  setCalendar: (blocks: CalendarBlock[]) => saveStored(STORAGE_KEYS.CALENDAR, blocks),

  getExpenses: () => loadStored<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES),
  setExpenses: (expenses: ExpenseItem[]) => saveStored(STORAGE_KEYS.EXPENSES, expenses),

  getWater: () => loadStored<WaterLog[]>(STORAGE_KEYS.WATER, INITIAL_WATER),
  setWater: (water: WaterLog[]) => saveStored(STORAGE_KEYS.WATER, water),

  getWeight: () => loadStored<WeightRecord[]>(STORAGE_KEYS.WEIGHT, INITIAL_WEIGHT),
  setWeight: (records: WeightRecord[]) => saveStored(STORAGE_KEYS.WEIGHT, records),

  getSugar: () => loadStored<SugarRecord[]>(STORAGE_KEYS.SUGAR, INITIAL_SUGAR),
  setSugar: (records: SugarRecord[]) => saveStored(STORAGE_KEYS.SUGAR, records),

  getFood: () => loadStored<FoodItem[]>(STORAGE_KEYS.FOOD, INITIAL_FOOD),
  setFood: (food: FoodItem[]) => saveStored(STORAGE_KEYS.FOOD, food),

  getWallet: () => loadStored<PawcoinWallet>(STORAGE_KEYS.WALLET, INITIAL_WALLET),
  setWallet: (wallet: PawcoinWallet) => saveStored(STORAGE_KEYS.WALLET, wallet),

  getAnalyticsUnlockTime: () => {
    if (typeof window === 'undefined') return 0;
    const raw = localStorage.getItem(STORAGE_KEYS.ANALYTICS_UNLOCKED);
    return raw ? parseInt(raw, 10) : 0;
  },
  setAnalyticsUnlockTime: (timestamp: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_UNLOCKED, timestamp.toString());
  },

  getDailyGoals: (): DailyGoals => {
    const loaded = loadStored<DailyGoals>(STORAGE_KEYS.DAILY_GOALS, DEFAULT_DAILY_GOALS);
    return {
      taskGoal: Number(loaded.taskGoal) || DEFAULT_DAILY_GOALS.taskGoal,
      spendingLimit: Number(loaded.spendingLimit) || DEFAULT_DAILY_GOALS.spendingLimit,
      waterTargetMl: Number(loaded.waterTargetMl) || DEFAULT_DAILY_GOALS.waterTargetMl,
    };
  },
  setDailyGoals: (goals: DailyGoals) => saveStored(STORAGE_KEYS.DAILY_GOALS, goals),
};
