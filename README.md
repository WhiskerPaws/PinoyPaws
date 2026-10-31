# WhiskerPaws

Daily routine and Pomodoro timer, finance tracker, and health vitals log with Pawcoin rewards.
React + Vite web app, packaged for Android with Capacitor, monetised with AdMob.

## Get the APK (no Android Studio needed)
1. Create a GitHub repo and push this folder to the `main` branch.
2. Open the **Actions** tab, then **Build WhiskerPaws APK**, then **Run workflow** (it also runs on every push).
3. When it finishes, download the **WhiskerPaws-apk** artifact, unzip it, and install `app-debug.apk` on your phone.

## Build locally (needs Node 22, JDK 21, Android SDK)
```
npm install
npx cap add android
npm run android:apk      # output: android/app/build/outputs/apk/debug/app-debug.apk
```

## AdMob
- By default the app uses Google's **test** ads. This is on purpose: never tap your own live ads.
- Your AdMob screenshot shows the app still needs "Link to app store". Live ads only serve after the
  app is on Google Play and linked in AdMob.
- When ready: set repo variables `ADMOB_APP_ID`, `VITE_ADMOB_BANNER_ID`, `VITE_ADMOB_INTERSTITIAL_ID`,
  `VITE_ADMOB_REWARDED_ID`, and `VITE_ADMOB_TESTING=false` (Settings > Secrets and variables > Actions > Variables).

## Browser dev
`npm run dev` runs the web version with the built-in mock ads.

## Before Play Store
- Change `appId` in `capacitor.config.ts` (permanent after first upload).
- Add a launcher icon (`@capacitor/assets`), privacy policy URL, and sign a release **AAB**.
