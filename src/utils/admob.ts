import { Capacitor } from '@capacitor/core';

/**
 * Real AdMob on Android (via @capacitor-community/admob); no-op in the browser,
 * where the app keeps using its built-in mock ad modals.
 *
 * Ad unit IDs come from Vite env vars. If they are missing, Google's official
 * TEST ad units are used, so you never click live ads on your own device.
 * Set VITE_ADMOB_TESTING=false only for the release you publish.
 */
const TEST = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

const env = import.meta.env;
const isTesting = env.VITE_ADMOB_TESTING !== 'false';
const unit = (key: keyof typeof TEST, envVal?: string) =>
  isTesting || !envVal ? TEST[key] : envVal;

const IDS = {
  banner: unit('banner', env.VITE_ADMOB_BANNER_ID),
  interstitial: unit('interstitial', env.VITE_ADMOB_INTERSTITIAL_ID),
  rewarded: unit('rewarded', env.VITE_ADMOB_REWARDED_ID),
};

export const isNative = () => Capacitor.isNativePlatform();

let initPromise: Promise<void> | null = null;

export function initAdMob(): Promise<void> {
  if (!isNative()) return Promise.resolve();
  if (!initPromise) {
    initPromise = (async () => {
      const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
      await AdMob.initialize({ initializeForTesting: isTesting });
      try {
        await AdMob.showBanner({
          adId: IDS.banner,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting,
        });
        // Banner floats over the WebView; leave room so it never covers content.
        document.body.style.paddingBottom = '64px';
      } catch (e) {
        console.warn('Banner failed', e);
      }
    })().catch((e) => console.warn('AdMob init failed', e));
  }
  return initPromise;
}

/** Shows a full-screen interstitial. Resolves true if an ad was shown. */
export async function showInterstitial(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    await initAdMob();
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareInterstitial({ adId: IDS.interstitial, isTesting });
    await AdMob.showInterstitial();
    return true;
  } catch (e) {
    console.warn('Interstitial failed', e);
    return false;
  }
}

/** Shows a rewarded video. Resolves true only if the user earned the reward. */
export async function showRewarded(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    await initAdMob();
    const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
    let rewarded = false;
    const sub = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      rewarded = true;
    });
    const dismissed = new Promise<void>(async (resolve) => {
      const d = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        d.remove();
        resolve();
      });
    });
    await AdMob.prepareRewardVideoAd({ adId: IDS.rewarded, isTesting });
    await AdMob.showRewardVideoAd();
    await dismissed;
    sub.remove();
    return rewarded;
  } catch (e) {
    console.warn('Rewarded ad failed', e);
    return false;
  }
}
