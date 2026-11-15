// Expo app configuration (replaces app.json so secrets can come from env vars).
//
// EXPO_PUBLIC_API_URL   backend URL baked into the app (e.g. https://pharmaguard-api.onrender.com)
// GOOGLE_SERVICES_JSON  path to google-services.json; on EAS use a "file" environment variable
module.exports = () => ({
  expo: {
    name: 'PharmaGuard AI',
    slug: 'pharmaguard-ai',
    scheme: 'pharmaguardai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0F4C81',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pharmaguard.ai',
      infoPlist: {
        NSFaceIDUsageDescription: 'PharmaGuard AI uses Face ID to unlock your session securely.',
        NSCameraUsageDescription: 'PharmaGuard AI uses the camera to scan medicine QR codes.',
      },
    },
    android: {
      package: 'com.pharmaguard.ai',
      versionCode: 1,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F4C81',
      },
      permissions: ['CAMERA', 'USE_BIOMETRIC', 'USE_FINGERPRINT', 'POST_NOTIFICATIONS'],
      edgeToEdgeEnabled: false,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      'expo-build-properties',
      'expo-secure-store',
      ['expo-local-authentication', { faceIDPermission: 'PharmaGuard AI uses Face ID to unlock your session securely.' }],
      ['expo-camera', { cameraPermission: 'PharmaGuard AI uses the camera to scan medicine QR codes.' }],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      // Paste the project ID printed by `npx eas-cli init` here (or set EAS_PROJECT_ID).
      eas: { projectId: process.env.EAS_PROJECT_ID || 'PASTE-YOUR-EAS-PROJECT-ID' },
    },
  },
});
