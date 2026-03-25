import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farmatech.ai',
  appName: 'FarmaTechAI',
  webDir: 'dist/public',
  server: {
    url: 'http://192.168.0.131:5000',
    cleartext: true
  }
};

export default config;
