import React, { useState, useEffect } from 'react';
import adVital from '../../assets/images/ad_vital_wellness_1793410025512.jpg';
import confetti from 'canvas-confetti';
import { Gift, X, Play, Volume2, VolumeX, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { playCoinSound, playPomodoroChime, playButtonTap } from '../../utils/audio';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
}) => {
  const [duration] = useState(10);
  const [remaining, setRemaining] = useState(10);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRemaining(10);
      setIsPlaying(true);
      setCompleted(false);
      setShowExitWarning(false);
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCompleted(true);
          playPomodoroChime();
          playCoinSound();
          try {
            confetti({
              particleCount: 80,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#10B981', '#F59E0B', '#3B82F6'],
            });
          } catch {
            // ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseAttempt = () => {
    playButtonTap();
    if (completed) {
      onRewardGranted();
      onClose();
    } else {
      setShowExitWarning(true);
    }
  };

  const handleClaimReward = () => {
    playButtonTap();
    onRewardGranted();
    onClose();
  };

  const progressPercent = ((duration - remaining) / duration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">REWARDED VIDEO AD</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Gift className="w-3.5 h-3.5" /> 24hr Advanced Analytics + 100 Pawcoins
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCloseAttempt}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video simulation stage */}
        <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
          <img
            src={adVital}
            alt="Pure Harvest Wellness Sponsor"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

          {/* Ad Countdown Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-neutral-700/60 rounded-md text-xs text-white">
            {completed ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Reward Granted!
              </span>
            ) : (
              <span className="font-mono tabular-nums">Reward in: {remaining}s</span>
            )}
          </div>

          {/* Bottom Video details */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="max-w-md">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Health Sponsor</span>
              <h3 className="text-lg font-bold text-white">Pure Harvest · Daily Vitality Nutrition</h3>
              <p className="text-xs text-neutral-300 mt-0.5">
                Cold-pressed adaptogens & essential electrolyte complex. Support metabolic balance and mental clarity.
              </p>
            </div>
          </div>
        </div>

        {/* Scrub / Progress Bar */}
        <div className="w-full h-1 bg-neutral-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Warning if early exit */}
        {showExitWarning && !completed && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Closing before the video ends will forfeit your 24hr Analytics Unlock and +100 Pawcoins!</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExitWarning(false)}
                className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-neutral-950 rounded hover:bg-amber-400 transition-colors"
              >
                Keep Watching ({remaining}s)
              </button>
              <button
                onClick={onClose}
                className="px-2 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Exit Anyway
              </button>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="p-5 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Watch the full video to claim your reward. Analytics charts unlock immediately.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {completed ? (
              <button
                onClick={handleClaimReward}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Claim Reward & View Analytics</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
                <span>Please wait {remaining} seconds...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
