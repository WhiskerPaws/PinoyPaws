// Runs after `cap sync`: injects the AdMob App ID into AndroidManifest.xml (idempotent).
import fs from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
if (!fs.existsSync(manifestPath)) {
  console.error('android/ not found. Run: npx cap add android');
  process.exit(1);
}
const appId = process.env.ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713'; // Google test app id
let xml = fs.readFileSync(manifestPath, 'utf8');
const tag = `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${appId}"/>`;

if (xml.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  xml = xml.replace(/<meta-data android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*\/>/, tag);
} else {
  xml = xml.replace('</application>', `    ${tag}\n    </application>`);
}
fs.writeFileSync(manifestPath, xml);
console.log('AdMob App ID set to', appId);
