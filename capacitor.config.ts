import { CapacitorConfig } from '@capacitor/cli';

// Set LIVE_URL to your deployed Vercel URL after deploying
// e.g. https://scruffs.vercel.app or https://scruffs.ae
const LIVE_URL = process.env.CAPACITOR_SERVER_URL ?? 'https://scruffs.vercel.app';

const config: CapacitorConfig = {
  appId: 'ae.scruffs.app',
  appName: 'Scruffs',
  webDir: 'out',

  // Point to live server so API routes work — no static export needed
  server: {
    url: LIVE_URL,
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'scruffs.vercel.app',
      'scruffs.ae',
      '*.scruffs.ae',
      'ep-nameless-brook-ai1tp1xb-pooler.c-4.us-east-1.aws.neon.tech',
    ],
  },

  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#F4F2EE',
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile',
    scheme: 'scruffs',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#F4F2EE',
    appendUserAgent: 'ScruffsApp/1.0',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F4F2EE',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#3A4F4A',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F4F2EE',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
