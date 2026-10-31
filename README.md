# WhiskerPaws (PDF scanner + toolkit)

Kotlin + Jetpack Compose. Scan to PDF (ML Kit), import PDFs, merge / split / compress,
share, freemium limits, and an AdMob banner for free users.

## Get the APK without Android Studio
1. Push this folder to a GitHub repo (`main` branch).
2. Actions tab > "Build WhiskerPaws APK" > Run workflow.
3. Download the `WhiskerPaws-apk` artifact and install `app-debug.apk` on your phone.

## Or build in Android Studio
Open the folder, let it sync, then Build > Build APK(s).

## Free vs Pro
| | Free | Pro |
|---|---|---|
| Scans | 3 per day, 5 pages each | Unlimited, 50 pages |
| Merge | up to 3 files | Unlimited |
| Compress | Smallest / Balanced | + Best quality |
| Ads | Banner | None |

## Before you earn money
1. **AdMob:** the app uses Google TEST ids. Put your real App ID in `AndroidManifest.xml`
   and your banner unit ID in `app/build.gradle.kts` (`BANNER_ID`). Link the app to its
   Play Store listing in AdMob ("Link to app store") once it is published.
2. **Billing:** the Pro unlock button exists in debug builds only. Wire up RevenueCat or
   Play Billing, then set `UsageLimiter.isPro` from the entitlement.
3. **Publishing:** add a launcher icon and privacy policy, sign a release AAB.
   The applicationId `com.whiskerpaws.pdf` is permanent after the first upload.
