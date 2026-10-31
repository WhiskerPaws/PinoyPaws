import React, { useState } from 'react';
import { WaterLog, WeightRecord, SugarRecord, FoodItem } from '../../types';
import {
  Heart,
  Droplets,
  Scale,
  Activity,
  Utensils,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { playButtonTap, playCoinSound } from '../../utils/audio';

interface HealthVitalsHubProps {
  water: WaterLog[];
  onWaterChange: (water: WaterLog[]) => void;
  weight: WeightRecord[];
  onWeightChange: (records: WeightRecord[]) => void;
  sugar: SugarRecord[];
  onSugarChange: (records: SugarRecord[]) => void;
  food: FoodItem[];
  onFoodChange: (food: FoodItem[]) => void;
  analyticsUnlocked: boolean;
  onWatchRewardedAd: () => void;
}

export const HealthVitalsHub: React.FC<HealthVitalsHubProps> = ({
  water,
  onWaterChange,
  weight,
  onWeightChange,
  sugar,
  onSugarChange,
  food,
  onFoodChange,
  analyticsUnlocked,
  onWatchRewardedAd,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'water' | 'bmi' | 'sugar' | 'food' | 'analytics'>('water');

  // Water state
  const waterTargetMl = 2500;
  const totalWaterToday = water.reduce((sum, item) => sum + item.amountMl, 0);
  const waterPercent = Math.min(100, Math.round((totalWaterToday / waterTargetMl) * 100));

  // Weight & BMI state
  const latestWeight = weight[weight.length - 1] || { weightKg: 70, heightCm: 175, bmi: 22.9 };
  const [inputWeightKg, setInputWeightKg] = useState(latestWeight.weightKg.toString());
  const [inputHeightCm, setInputHeightCm] = useState(latestWeight.heightCm.toString());

  // Sugar state
  const [inputSugarVal, setInputSugarVal] = useState('95');
  const [inputSugarTiming, setInputSugarTiming] = useState<SugarRecord['timing']>('Fasting');

  // Food state
  const [foodMeal, setFoodMeal] = useState<FoodItem['meal']>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('350');
  const [foodProtein, setFoodProtein] = useState('20');
  const [foodCarbs, setFoodCarbs] = useState('40');
  const [foodFat, setFoodFat] = useState('10');

  // Water Actions
  const handleAddWater = (ml: number) => {
    playCoinSound();
    const newLog: WaterLog = {
      id: `w-${Date.now()}`,
      amountMl: ml,
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    onWaterChange([...water, newLog]);
  };

  const handleResetWater = () => {
    playButtonTap();
    onWaterChange([]);
  };

  // BMI Calculation
  const wKg = parseFloat(inputWeightKg) || 0;
  const hM = (parseFloat(inputHeightCm) || 0) / 100;
  const currentBmi = hM > 0 && wKg > 0 ? Math.round((wKg / (hM * hM)) * 10) / 10 : 0;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', bg: 'bg-blue-400' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400', bg: 'bg-amber-400' };
    return { label: 'Obese', color: 'text-red-400', bg: 'bg-red-400' };
  };

  const bmiCat = getBmiCategory(currentBmi);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (wKg <= 0 || hM <= 0) return;
    playCoinSound();

    const record: WeightRecord = {
      id: `wt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: wKg,
      heightCm: parseFloat(inputHeightCm),
      bmi: currentBmi,
      notes: 'Logged milestone',
    };
    onWeightChange([...weight, record]);
  };

  // Sugar Actions
  const handleSaveSugar = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputSugarVal, 10);
    if (isNaN(val) || val <= 0) return;
    playCoinSound();

    const record: SugarRecord = {
      id: `sg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      valueMgDl: val,
      timing: inputSugarTiming,
    };
    onSugarChange([record, ...sugar]);
  };

  const getSugarBadge = (val: number, timing: SugarRecord['timing']) => {
    if (timing === 'Fasting') {
      if (val < 70) return { label: 'Low (<70)', color: 'text-blue-400' };
      if (val <= 99) return { label: 'Normal (70-99)', color: 'text-emerald-400' };
      if (val <= 125) return { label: 'Elevated (100-125)', color: 'text-amber-400' };
      return { label: 'High (126+)', color: 'text-red-400' };
    }
    // Post-meal
    if (val < 140) return { label: 'Normal (<140)', color: 'text-emerald-400' };
    if (val <= 199) return { label: 'Elevated (140-199)', color: 'text-amber-400' };
    return { label: 'High (200+)', color: 'text-red-400' };
  };

  // Food Actions
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    playCoinSound();

    const item: FoodItem = {
      id: `fd-${Date.now()}`,
      meal: foodMeal,
      name: foodName.trim(),
      calories: parseInt(foodCalories, 10) || 0,
      proteinG: parseInt(foodProtein, 10) || 0,
      carbsG: parseInt(foodCarbs, 10) || 0,
      fatG: parseInt(foodFat, 10) || 0,
      date: new Date().toISOString().split('T')[0],
    };

    onFoodChange([item, ...food]);
    setFoodName('');
  };

  const totalCaloriesToday = food.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinToday = food.reduce((sum, item) => sum + item.proteinG, 0);
  const totalCarbsToday = food.reduce((sum, item) => sum + item.carbsG, 0);
  const totalFatToday = food.reduce((sum, item) => sum + item.fatG, 0);

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Blueprint 3 · Health & Vitals Milestone Log</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Personal Vitals & Nutrition Tracker
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Rapid milestone logging for daily hydration, weight/BMI curve, blood glucose, and macronutrient balance.
          </p>
        </div>

        {/* Analytics Rewarded ad status badge */}
        <div className="flex items-center gap-2">
          {analyticsUnlocked ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Advanced Analytics Unlocked (24h)</span>
            </div>
          ) : (
            <button
              onClick={onWatchRewardedAd}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Watch Video Ad to Unlock Charts (+100 Coins)</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs for Vitals Modules */}
      <div className="flex items-center gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => {
            playButtonTap();
            setActiveSubTab('water');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'water'
              ? 'bg-blue-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Water Intake ({totalWaterToday} ml)</span>
        </button>

        <button
          onClick={() => {
            playButtonTap();
            setActiveSubTab('bmi');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'bmi'
              ? 'bg-emerald-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Weight & BMI ({currentBmi} BMI)</span>
        </button>

        <button
          onClick={() => {
            playButtonTap();
            setActiveSubTab('sugar');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'sugar'
              ? 'bg-rose-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Sugar Levels (mg/dL)</span>
        </button>

        <button
          onClick={() => {
            playButtonTap();
            setActiveSubTab('food');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'food'
              ? 'bg-amber-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Food & Macros ({totalCaloriesToday} kcal)</span>
        </button>

        <button
          onClick={() => {
            playButtonTap();
            setActiveSubTab('analytics');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ml-auto ${
            activeSubTab === 'analytics'
              ? 'bg-purple-500 text-white'
              : 'text-purple-400 hover:text-purple-300'
          }`}
        >
          {analyticsUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>Monthly Analytics</span>
        </button>
      </div>

      {/* Tab 1: Water Intake */}
      {activeSubTab === 'water' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 flex flex-col items-center shadow-lg text-center">
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Today's Hydration</span>
            <div className="text-4xl font-black text-white font-mono mt-2 tabular-nums">
              {totalWaterToday} <span className="text-lg text-neutral-400 font-sans font-normal">/ {waterTargetMl} mL</span>
            </div>

            {/* Cylinder Water Graphic */}
            <div className="relative w-28 h-48 my-5 rounded-2xl border-2 border-blue-500/40 bg-neutral-950 overflow-hidden shadow-inner flex flex-col justify-end p-1">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-xl transition-all duration-700 ease-out opacity-90"
                style={{ height: `${waterPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-white drop-shadow">
                {waterPercent}%
              </div>
            </div>

            {/* Quick add buttons */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-2">
              <button
                onClick={() => handleAddWater(250)}
                className="py-2 px-3 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30 transition-colors"
              >
                +250 mL Glass
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="py-2 px-3 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30 transition-colors"
              >
                +500 mL Bottle
              </button>
              <button
                onClick={() => handleAddWater(750)}
                className="py-2 px-3 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30 transition-colors"
              >
                +750 mL Flask
              </button>
            </div>

            <button
              onClick={handleResetWater}
              className="mt-4 text-xs text-neutral-500 hover:text-neutral-300"
            >
              Reset today's logs
            </button>
          </div>

          <div className="md:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">
              Hydration Log Timeline
            </h3>
            <div className="space-y-2 mt-3 flex-1 overflow-y-auto max-h-[300px]">
              {water.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No water logged yet today. Click one of the presets to begin.
                </div>
              ) : (
                water.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-white">+{log.amountMl} mL</span>
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Weight & BMI */}
      {activeSubTab === 'bmi' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-neutral-800">
              Compute BMI & Log Weight
            </h3>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputWeightKg}
                    onChange={(e) => setInputWeightKg(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="1"
                    value={inputHeightCm}
                    onChange={(e) => setInputHeightCm(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              {/* Real-time Computed BMI Gauge */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-center space-y-2">
                <span className="text-xs text-neutral-400">Calculated Body Mass Index:</span>
                <div className="text-3xl font-black font-mono text-white tabular-nums">
                  {currentBmi}
                </div>
                <div className={`text-xs font-bold ${bmiCat.color}`}>
                  WHO Classification: {bmiCat.label}
                </div>

                {/* BMI Spectrum Scale */}
                <div className="w-full h-2 rounded-full flex overflow-hidden mt-3">
                  <div className="h-full bg-blue-500 w-1/4" title="Underweight (<18.5)" />
                  <div className="h-full bg-emerald-500 w-1/4" title="Normal (18.5 - 24.9)" />
                  <div className="h-full bg-amber-500 w-1/4" title="Overweight (25 - 29.9)" />
                  <div className="h-full bg-red-500 w-1/4" title="Obese (30+)" />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>18.5</span>
                  <span>25.0</span>
                  <span>30.0</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl transition-colors"
              >
                Log Today's Milestone
              </button>
            </form>
          </div>

          <div className="md:col-span-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">
              Weight History Entries
            </h3>
            <div className="space-y-2 mt-3 flex-1 overflow-y-auto max-h-[300px]">
              {weight.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white">{rec.weightKg} kg</span>
                    <span className="text-xs text-neutral-400 ml-2 font-mono">({rec.bmi} BMI)</span>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{rec.notes || 'Routine check'}</div>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">{rec.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sugar Levels (Blood Glucose) */}
      {activeSubTab === 'sugar' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-neutral-800">
              Log Blood Glucose Reading
            </h3>

            <form onSubmit={handleSaveSugar} className="space-y-4">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={inputSugarVal}
                  onChange={(e) => setInputSugarVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-lg font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Measurement Timing</label>
                <select
                  value={inputSugarTiming}
                  onChange={(e) => setInputSugarTiming(e.target.value as SugarRecord['timing'])}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                >
                  <option value="Fasting">Fasting (Morning baseline)</option>
                  <option value="Pre-Meal">Pre-Meal</option>
                  <option value="Post-Meal (2h)">Post-Meal (2 hours)</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Random">Random</option>
                </select>
              </div>

              {/* Status preview */}
              {inputSugarVal && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
                  <span className="text-[11px] text-neutral-400">Clinical Classification:</span>
                  <div className={`text-sm font-bold mt-1 ${getSugarBadge(parseInt(inputSugarVal, 10), inputSugarTiming).color}`}>
                    {getSugarBadge(parseInt(inputSugarVal, 10), inputSugarTiming).label}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-neutral-950 rounded-xl transition-colors font-bold"
              >
                Save Glucose Reading
              </button>
            </form>
          </div>

          <div className="md:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">
              Recent Glucose Timeline
            </h3>
            <div className="space-y-2 mt-3 flex-1 overflow-y-auto max-h-[300px]">
              {sugar.map((rec) => {
                const badge = getSugarBadge(rec.valueMgDl, rec.timing);
                return (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold font-mono text-white tabular-nums">
                          {rec.valueMgDl} mg/dL
                        </span>
                        <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {rec.timing}
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium block mt-0.5 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="text-right text-xs text-neutral-500 font-mono">
                      <span>{rec.date}</span>
                      <span className="block text-[10px]">{rec.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Food Logs & Macros */}
      {activeSubTab === 'food' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-neutral-800">
              Log Meal & Nutritional Macros
            </h3>

            <form onSubmit={handleAddFood} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Meal Time</label>
                <select
                  value={foodMeal}
                  onChange={(e) => setFoodMeal(e.target.value as FoodItem['meal'])}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Item Description</label>
                <input
                  type="text"
                  placeholder="e.g. Scrambled eggs, sourdough, avocado"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Calories</label>
                  <input
                    type="number"
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-center text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={foodProtein}
                    onChange={(e) => setFoodProtein(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-center text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={foodCarbs}
                    onChange={(e) => setFoodCarbs(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-center text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={foodFat}
                    onChange={(e) => setFoodFat(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-center text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-colors font-bold mt-2"
              >
                Log Meal Item
              </button>
            </form>
          </div>

          <div className="md:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg flex flex-col justify-between">
            <div>
              {/* Daily Macro Summary Bar */}
              <div className="grid grid-cols-4 gap-2 pb-4 border-b border-neutral-800 text-center">
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block uppercase">Energy</span>
                  <span className="text-sm font-bold text-white font-mono">{totalCaloriesToday}</span>
                  <span className="text-[10px] text-neutral-500 block">kcal</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block uppercase">Protein</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{totalProteinToday}g</span>
                  <span className="text-[10px] text-neutral-500 block">amino</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block uppercase">Carbs</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{totalCarbsToday}g</span>
                  <span className="text-[10px] text-neutral-500 block">glyco</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 block uppercase">Lipids</span>
                  <span className="text-sm font-bold text-blue-400 font-mono">{totalFatToday}g</span>
                  <span className="text-[10px] text-neutral-500 block">fat</span>
                </div>
              </div>

              {/* Food Items List */}
              <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto pr-1">
                {food.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                        <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {item.meal}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400 font-mono">
                        <span>{item.calories} kcal</span>
                        <span>·</span>
                        <span>P: {item.proteinG}g</span>
                        <span>C: {item.carbsG}g</span>
                        <span>F: {item.fatG}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Advanced Monthly Analytics (Ad Strategy: Unlocking requires watching rewarded video ad) */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {!analyticsUnlocked ? (
            /* Locked State with rewarded ad CTA */
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 p-8 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400">
                <Lock className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">Unlock Advanced 30-Day Analytics & Correlations</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Gain deep physiological and financial visibility: 30-day weight trajectory, glucose volatility curves, and expense category distributions.
                </p>
              </div>

              <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl max-w-sm mx-auto text-xs text-neutral-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30-Day Weight Trajectory & BMI Delta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Blood Glucose Volatility Dispersion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Focus Hours vs Hydration Consistency</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400 font-semibold pt-1">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Bonus: +100 Pawcoins instantly credited</span>
                </div>
              </div>

              <button
                onClick={onWatchRewardedAd}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Watch 10s Rewarded Video to Unlock</span>
              </button>
            </div>
          ) : (
            /* Unlocked Full Analytics View */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs text-purple-300">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Advanced Analytics Active:</strong> Unlocked via Rewarded Video Ad. Full 30-day correlation telemetry enabled.
                  </span>
                </div>
                <span className="font-mono text-[11px] text-purple-400">Expires in 23h 59m</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 30-Day Weight & BMI Trend */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">
                    30-Day Weight Trajectory (kg)
                  </h4>
                  <div className="h-44 mt-4 flex items-end justify-between gap-2 px-2 pt-4">
                    {[72.2, 72.0, 71.8, 71.6, 71.5, 71.2, 71.0, 70.8].map((val, i) => {
                      const heightPct = ((val - 70) / (73 - 70)) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-mono text-neutral-400 tabular-nums">{val}</span>
                          <div
                            className="w-full bg-emerald-500/60 hover:bg-emerald-400 rounded-t-md transition-all duration-300"
                            style={{ height: `${Math.max(15, heightPct)}%` }}
                          />
                          <span className="text-[9px] text-neutral-500 font-mono">D-{8 - i}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-3 text-center">
                    📉 Down -1.4 kg over last 3 weeks (Optimal sustained deficit)
                  </p>
                </div>

                {/* Glucose Volatility Distribution */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">
                    Glucose Stability Dispersion (mg/dL)
                  </h4>
                  <div className="h-44 mt-4 flex items-end justify-between gap-3 px-2 pt-4">
                    {[
                      { time: 'Fasting', val: 92, target: 95 },
                      { time: 'Post-Bfast', val: 118, target: 140 },
                      { time: 'Pre-Lunch', val: 96, target: 100 },
                      { time: 'Post-Lunch', val: 124, target: 140 },
                      { time: 'Dinner', val: 110, target: 140 },
                    ].map((entry, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono text-neutral-300 tabular-nums">{entry.val}</span>
                        <div
                          className="w-full bg-rose-500/70 hover:bg-rose-400 rounded-t-md transition-all"
                          style={{ height: `${(entry.val / 160) * 100}%` }}
                        />
                        <span className="text-[9px] text-neutral-500 truncate w-full text-center">
                          {entry.time}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-3 text-center">
                    ✅ 98% of readings inside optimal target range (70–140 mg/dL)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
