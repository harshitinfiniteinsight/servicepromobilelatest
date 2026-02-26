import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servicepro.mobile',
  appName: 'ServicePro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366F1',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6366F1',
    },
  },
};

export default config;


