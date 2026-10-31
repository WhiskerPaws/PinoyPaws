import React from 'react';
import { PawcoinWallet } from '../types';
import { Coins, X, Check, Lock, Sparkles, Flame, Clock, Award } from 'lucide-react';
import { playButtonTap, playCoinSound } from '../utils/audio';

interface PawcoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: PawcoinWallet;
  onUnlockPerk: (perkId: string, cost: number) => void;
}

interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'Audio' | 'Theme' | 'Streak';
}

const AVAILABLE_PERKS: Perk[] = [
  { id: 'sound_zen_bell', name: 'Zen Temple Bell Sound', description: 'Deep calming chime when Pomodoro sessions finish', cost: 100, category: 'Audio' },
  { id: 'sound_digital_synth', name: 'Cyberpunk Synth Arp', description: 'Retro futurist arpeggio completion chime', cost: 150, category: 'Audio' },
  { id: 'theme_obsidian_gold', name: 'Obsidian & Gold Theme', description: 'High-contrast luxury dark palette for the dashboard', cost: 250, category: 'Theme' },
  { id: 'theme_emerald_flow', name: 'Forest Emerald Theme', description: 'Biophilic soothing green color scheme', cost: 250, category: 'Theme' },
  { id: 'perk_streak_shield', name: 'Streak Freeze Shield', description: 'Protects your daily consistency streak if you miss a day', cost: 300, category: 'Streak' },
];

export const PawcoinsModal: React.FC<PawcoinsModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onUnlockPerk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100">Pawcoins Rewards Vault</h2>
              <p className="text-xs text-neutral-400">Earn tokens by finishing focus blocks and viewing sponsor clips</p>
            </div>
          </div>
          <button
            onClick={() => {
              playButtonTap();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-6 border-b border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Available Balance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {wallet.balance}
                </span>
                <span className="text-sm font-semibold text-amber-300/80">Pawcoins</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-300">
              <div className="text-right">
                <span className="text-neutral-500 block text-[11px]">Daily Streak</span>
                <span className="font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {wallet.streakDays} days
                </span>
              </div>
              <div className="w-px h-8 bg-neutral-800" />
              <div className="text-right">
                <span className="text-neutral-500 block text-[11px]">All-Time</span>
                <span className="font-mono text-neutral-200 tabular-nums">{wallet.totalEarned}</span>
              </div>
            </div>
          </div>

          {/* How to earn */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/50">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Pomodoro Ad: <strong className="text-amber-400">+50</strong></span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/50">
              <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Rewarded Ad: <strong className="text-emerald-400">+100</strong></span>
            </div>
          </div>
        </div>

        {/* Perks list */}
        <div className="p-6 overflow-y-auto space-y-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Redeemable Perks & Upgrades
          </h3>

          {AVAILABLE_PERKS.map((perk) => {
            const isUnlocked = wallet.unlockedPerks.includes(perk.id);
            const canAfford = wallet.balance >= perk.cost;

            return (
              <div
                key={perk.id}
                className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-200 truncate">{perk.name}</span>
                    <span className="text-[10px] text-neutral-400 border border-neutral-800 px-1.5 py-0.5 rounded">
                      {perk.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{perk.description}</p>
                </div>

                <div className="shrink-0">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        playButtonTap();
                        playCoinSound();
                        onUnlockPerk(perk.id, perk.cost);
                      }}
                      disabled={!canAfford}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer shadow-sm'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
                      }`}
                    >
                      {canAfford ? <Sparkles className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{perk.cost} Coins</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 text-center text-xs text-neutral-500">
          Pawcoins never expire. Tokens reset locally upon clearing browser cache.
        </div>
      </div>
    </div>
  );
};
