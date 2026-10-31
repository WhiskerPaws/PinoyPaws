import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whiskerpaws.app', // change once, before first Play Store upload
  appName: 'WhiskerPaws',
  webDir: 'dist',
  android: {
    backgroundColor: '#0a0a0a',
  },
};

export default config;
