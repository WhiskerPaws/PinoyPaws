import React, { useState } from 'react';
import adFintrack from '../../assets/images/ad_fintrack_card_1793410024683.jpg';
import { ExternalLink, Info } from 'lucide-react';
import { playButtonTap } from '../../utils/audio';
import { isNative } from '../../utils/admob';

export const AdMobBanner: React.FC = () => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleAdClick = () => {
    playButtonTap();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2400);
  };

  // On Android the real AdMob banner is drawn natively at the bottom of the screen.
  if (isNative()) return null;

  return (
    <div className="w-full mt-6 pt-3 border-t border-neutral-800/80">
      <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/90 overflow-hidden shadow-sm hover:border-neutral-700 transition-colors">
        {/* AdMob label bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-neutral-950/60 border-b border-neutral-800/60 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-neutral-300 font-semibold">Ad</span>
            <span>·</span>
            <span>AdMob by Google</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer" title="AdChoices Information">
            <span>AdChoices</span>
            <Info className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Banner content */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800">
              <img
                src={adFintrack}
                alt="Aether Platinum Titanium Card"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-100 tracking-tight truncate">
                  Aether Platinum Card
                </span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  3.5% Cashback
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                Zero annual fees, automated expense categorization, and seamless multi-currency spending.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {copiedNotification && (
              <span className="text-[11px] text-amber-400 font-medium">Opening offer...</span>
            )}
            <button
              onClick={handleAdClick}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors border border-neutral-700/80 cursor-pointer"
            >
              <span>Learn More</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
