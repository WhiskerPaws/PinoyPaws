/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calculator,
  Heart,
  Coins,
  Menu,
  X,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  Headphones,
  Waves,
  Trees,
  Play,
  Square,
} from 'lucide-react';

import { Task, CalendarBlock, ExpenseItem, WaterLog, WeightRecord, SugarRecord, FoodItem, PawcoinWallet } from './types';
import { storage } from './utils/storage';
import { playButtonTap, playCoinSound, startAmbience, stopAmbience, setAmbienceVolume } from './utils/audio';

import { RoutineHub } from './components/routine/RoutineHub';
import { FinancialSuite } from './components/financial/FinancialSuite';
import { HealthVitalsHub } from './components/health/HealthVitalsHub';
import { DailyOverview } from './components/dashboard/DailyOverview';

import { InterstitialAdModal } from './components/ads/InterstitialAdModal';
import { RewardedAdModal } from './components/ads/RewardedAdModal';
import { PawcoinsModal } from './components/PawcoinsModal';
import { initAdMob, isNative, showInterstitial, showRewarded } from './utils/admob';

type NavView = 'pomodoro' | 'financial' | 'vitals';
type AmbienceType = 'white_noise' | 'forest_sounds';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<NavView>('pomodoro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Background Ambience State
  const [ambienceType, setAmbienceType] = useState<AmbienceType>('white_noise');
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);
  const [ambienceVol, setAmbienceVol] = useState(0.4);


  // Data States
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [calendar, setCalendar] = useState<CalendarBlock[]>(() => storage.getCalendar());
  const [activeTaskId, setActiveTaskId] = useState<string | null>('task-1');

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => storage.getExpenses());

  const [water, setWater] = useState<WaterLog[]>(() => storage.getWater());
  const [weight, setWeight] = useState<WeightRecord[]>(() => storage.getWeight());
  const [sugar, setSugar] = useState<SugarRecord[]>(() => storage.getSugar());
  const [food, setFood] = useState<FoodItem[]>(() => storage.getFood());

  const [wallet, setWallet] = useState<PawcoinWallet>(() => storage.getWallet());

  // Analytics Ad Unlock state (unlocked if timestamp > Date.now())
  const [analyticsUnlockedUntil, setAnalyticsUnlockedUntil] = useState<number>(() =>
    storage.getAnalyticsUnlockTime()
  );

  // Modals state
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [isRewardedOpen, setIsRewardedOpen] = useState(false);
  const [isPawcoinsModalOpen, setIsPawcoinsModalOpen] = useState(false);

  // Start real AdMob on Android (no-op in browser)
  useEffect(() => {
    initAdMob();
  }, []);

  // Persist states on changes
  useEffect(() => {
    storage.setTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.setCalendar(calendar);
  }, [calendar]);

  useEffect(() => {
    storage.setExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    storage.setWater(water);
  }, [water]);

  useEffect(() => {
    storage.setWeight(weight);
  }, [weight]);

  useEffect(() => {
    storage.setSugar(sugar);
  }, [sugar]);

  useEffect(() => {
    storage.setFood(food);
  }, [food]);

  useEffect(() => {
    storage.setWallet(wallet);
  }, [wallet]);

  // Ambience Handlers
  const handleToggleAmbiencePlay = () => {
    playButtonTap();
    if (isAmbiencePlaying) {
      stopAmbience();
      setIsAmbiencePlaying(false);
    } else {
      startAmbience(ambienceType, ambienceVol);
      setIsAmbiencePlaying(true);
    }
  };

  const handleSelectAmbienceType = (type: AmbienceType) => {
    playButtonTap();
    setAmbienceType(type);
    if (isAmbiencePlaying) {
      startAmbience(type, ambienceVol);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbienceVol(vol);
    setAmbienceVolume(vol);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAmbience();
    };
  }, []);

  // Handle switching view with sound & close mobile drawer
  const handleNavClick = (view: NavView) => {
    playButtonTap();
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // Pawcoins Reward Handlers
  const handleClaimInterstitial = (bonusCoins: number) => {
    setIsInterstitialOpen(false);
    const updatedWallet: PawcoinWallet = {
      ...wallet,
      balance: wallet.balance + bonusCoins,
      totalEarned: wallet.totalEarned + bonusCoins,
    };
    setWallet(updatedWallet);
  };

  const handleRewardedAdComplete = () => {
    // 24 hours from now
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    setAnalyticsUnlockedUntil(expiry);
    storage.setAnalyticsUnlockTime(expiry);

    const updatedWallet: PawcoinWallet = {
      ...wallet,
      balance: wallet.balance + 100,
      totalEarned: wallet.totalEarned + 100,
    };
    setWallet(updatedWallet);
  };

  const handleUnlockPerk = (perkId: string, cost: number) => {
    if (wallet.balance < cost) return;
    const updatedWallet: PawcoinWallet = {
      ...wallet,
      balance: wallet.balance - cost,
      unlockedPerks: [...wallet.unlockedPerks, perkId],
    };
    setWallet(updatedWallet);
  };

  // On Android use real AdMob ads; in the browser fall back to the mock modals.
  const handleSessionCompleted = async () => {
    if (isNative()) {
      if (await showInterstitial()) handleClaimInterstitial(50);
      return;
    }
    setIsInterstitialOpen(true);
  };

  const handleWatchRewardedAd = async () => {
    if (isNative()) {
      if (await showRewarded()) handleRewardedAdComplete();
      return;
    }
    setIsRewardedOpen(true);
  };

  const isAnalyticsUnlocked = analyticsUnlockedUntil > Date.now();

  const navItems = [
    {
      id: 'pomodoro' as NavView,
      label: 'Pomodoro Timer',
      sublabel: 'Focus clock & task sync',
      icon: Clock,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    {
      id: 'financial' as NavView,
      label: 'Financial Suite',
      sublabel: 'Calculator & expense log',
      icon: Calculator,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'vitals' as NavView,
      label: 'Health Vitals',
      sublabel: 'Water, BMI, glucose & food',
      icon: Heart,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
              🐾
            </div>
            <span className="font-bold text-sm tracking-tight text-white">WhiskerPaws</span>
          </div>
        </div>

        {/* Pawcoin balance header pill */}
        <button
          onClick={() => {
            playButtonTap();
            setIsPawcoinsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-semibold text-amber-400 hover:border-amber-500/40 transition-colors"
        >
          <Coins className="w-3.5 h-3.5 fill-amber-400/20" />
          <span className="font-mono tabular-nums">{wallet.balance}</span>
        </button>
      </header>

      {/* Responsive Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-full md:h-screen w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand wordmark zone */}
        <div>
          <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base shadow-inner">
                🐾
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  WhiskerPaws
                </span>
                <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-semibold">
                  Daily Operating Hub
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold px-3 block mb-2">
              Blueprints
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? `${item.activeBg} shadow-sm font-semibold`
                      : 'border-transparent text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-neutral-950/60' : 'bg-neutral-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-neutral-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 block truncate mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Background Ambience Toggle Card */}
          <div className="mx-4 my-2 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span>Focus Ambience</span>
              </div>

              {/* Status indicator badge */}
              <div className="flex items-center gap-1">
                {isAmbiencePlaying ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
                      <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]" />
                    </span>
                    <span>Playing</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Selection between White Noise and Forest Sounds */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950/80 rounded-lg border border-neutral-800 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectAmbienceType('white_noise')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
                  ambienceType === 'white_noise'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/80'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Continuous smooth white/pink noise mask"
              >
                <Waves className="w-3 h-3 text-cyan-400" />
                <span className="truncate">White Noise</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAmbienceType('forest_sounds')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
                  ambienceType === 'forest_sounds'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/80'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Breeze through forest canopy with subtle bird chirps"
              >
                <Trees className="w-3 h-3 text-emerald-400" />
                <span className="truncate">Forest</span>
              </button>
            </div>

            {/* Play/Stop and Volume Slider Controls */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleToggleAmbiencePlay}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isAmbiencePlaying
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80'
                }`}
              >
                {isAmbiencePlaying ? (
                  <>
                    <Square className="w-3 h-3 fill-current text-amber-400" />
                    <span>Mute Sound</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current text-emerald-400" />
                    <span>Play {ambienceType === 'white_noise' ? 'Noise' : 'Forest'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 shrink-0 px-2 py-1 bg-neutral-950/70 border border-neutral-800 rounded-lg" title="Adjust sound volume">
                <Volume2 className="w-3 h-3 text-neutral-500" />
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={ambienceVol}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-12 h-1 accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Pawcoins Card & Quick Trigger */}
        <div className="p-4 border-t border-neutral-800/80 space-y-3 bg-neutral-950/60">
          <div
            onClick={() => {
              playButtonTap();
              setIsPawcoinsModalOpen(true);
            }}
            className="p-3 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-amber-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Pawcoins</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Level 2
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
                {wallet.balance}
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{wallet.streakDays}d streak</span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 mt-1 truncate group-hover:text-amber-300 transition-colors">
              Tap to open rewards vault & perks →
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
            <span>v1.0 Local Storage</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Daily Overview Snapshot (Android-optimized touch card) */}
        <DailyOverview
          tasks={tasks}
          expenses={expenses}
          water={water}
          dailyBudget={120}
          waterTargetMl={2500}
          onNavigate={(view) => handleNavClick(view)}
          onQuickAddWater={(ml) => {
            const newLog: WaterLog = {
              id: `w-${Date.now()}`,
              amountMl: ml,
              timestamp: new Date().toTimeString().slice(0, 5),
            };
            setWater((prev) => [...prev, newLog]);
          }}
        />

        {currentView === 'pomodoro' && (
          <RoutineHub
            tasks={tasks}
            onTasksChange={setTasks}
            calendar={calendar}
            onCalendarChange={setCalendar}
            onSessionCompleted={handleSessionCompleted}
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
            ambiencePlaying={isAmbiencePlaying}
            ambienceType={ambienceType}
            onToggleAmbience={handleToggleAmbiencePlay}
          />
        )}

        {currentView === 'financial' && (
          <FinancialSuite
            expenses={expenses}
            onExpensesChange={setExpenses}
          />
        )}

        {currentView === 'vitals' && (
          <HealthVitalsHub
            water={water}
            onWaterChange={setWater}
            weight={weight}
            onWeightChange={setWeight}
            sugar={sugar}
            onSugarChange={setSugar}
            food={food}
            onFoodChange={setFood}
            analyticsUnlocked={isAnalyticsUnlocked}
            onWatchRewardedAd={handleWatchRewardedAd}
          />
        )}
      </main>

      {/* Modals */}
      <InterstitialAdModal
        isOpen={isInterstitialOpen}
        onClose={handleClaimInterstitial}
      />

      <RewardedAdModal
        isOpen={isRewardedOpen}
        onClose={() => setIsRewardedOpen(false)}
        onRewardGranted={handleRewardedAdComplete}
      />

      <PawcoinsModal
        isOpen={isPawcoinsModalOpen}
        onClose={() => setIsPawcoinsModalOpen(false)}
        wallet={wallet}
        onUnlockPerk={handleUnlockPerk}
      />
    </div>
  );
}
