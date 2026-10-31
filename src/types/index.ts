export type ActiveTab = 'routine' | 'financial' | 'health' | 'analytics';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  category: 'Work' | 'Study' | 'Health' | 'Creative' | 'Personal';
  priority?: TaskPriority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: string;
  subtasks?: SubTask[];
}

export interface CalendarBlock {
  id: string;
  time: string; // e.g. "09:00 - 10:00"
  hour: number; // 9
  title: string;
  category: 'Work' | 'Study' | 'Health' | 'Personal' | 'Rest' | 'Creative';
  taskId?: string;
  completed?: boolean;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  category: 'Food & Dining' | 'Transport' | 'Tools & Tech' | 'Health & Fitness' | 'Entertainment' | 'Groceries' | 'Utilities' | 'Other';
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: 'Card' | 'Cash' | 'Digital Wallet';
}

export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string;
}

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  notes?: string;
}

export interface SugarRecord {
  id: string;
  date: string;
  time: string;
  valueMgDl: number;
  timing: 'Fasting' | 'Pre-Meal' | 'Post-Meal (2h)' | 'Bedtime' | 'Random';
  notes?: string;
}

export interface FoodItem {
  id: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  date: string;
}

export interface PawcoinWallet {
  balance: number;
  totalEarned: number;
  streakDays: number;
  unlockedPerks: string[];
}

export interface DailyGoals {
  taskGoal: number; // Target number of tasks completed per day
  spendingLimit: number; // Target maximum daily spending in USD
  waterTargetMl: number; // Target daily hydration in mL
}
