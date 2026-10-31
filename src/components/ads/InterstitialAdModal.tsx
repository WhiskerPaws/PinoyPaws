import React, { useState, useEffect } from 'react';
import adFocusDesk from '../../assets/images/ad_focus_desk_1793410023410.jpg';
import confetti from 'canvas-confetti';
import { Sparkles, X, Volume2, VolumeX, ExternalLink, ShieldCheck } from 'lucide-react';
import { playCoinSound, playButtonTap } from '../../utils/audio';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: (pawcoinsEarned: number) => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({ isOpen, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      setClaimed(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimAndClose = () => {
    playButtonTap();
    playCoinSound();
    setClaimed(true);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#10B981'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onClose(50);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar with ad label and countdown / skip */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/70 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">ADVERTISEMENT</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Bonus +50 Pawcoins
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {canSkip ? (
              <button
                onClick={handleClaimAndClose}
                disabled={claimed}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-md transition-all shadow-sm"
              >
                <span>Claim +50 & Skip</span>
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-xs tabular-nums">
                <span>Skip in {countdown}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor Creative Media */}
        <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
          <img
            src={adFocusDesk}
            alt="Nordic Focus Desk Setup"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="max-w-md">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Featured Sponsor</span>
              <h3 className="text-lg font-bold text-white tracking-tight">Koto Ergonomics · Minimalist Walnut Desk</h3>
              <p className="text-xs text-neutral-300 mt-1 line-clamp-2">
                Engineered for deep work. Sustainable solid timber, silent motorized lift, and precision ambient task lighting.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action and Reward Claim */}
        <div className="p-5 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pomodoro completed! Claim your reward to maintain focus streak.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href="https://workspace.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <span>Visit Sponsor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleClaimAndClose}
              disabled={!canSkip || claimed}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                canSkip
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer shadow-md'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{canSkip ? 'Claim +50 Pawcoins' : `Unlocking in ${countdown}s...`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
