/**
 * ══════════════════════════════════════════════════════════════
 *  FASE 2 PLACEHOLDER — Capacitor configuratie
 *  Nog NIET actief. Dit bestand documenteert het pad naar de
 *  native iOS-app (Fase 2) zodat de codebase er klaar voor is.
 *
 *  Activeren in Fase 2:
 *    npm i -D @capacitor/cli && npm i @capacitor/core
 *    npx cap init && npx cap add ios
 *
 *  Benodigde Capacitor-plugins voor Fase 2:
 *    @capacitor/push-notifications        → native push (FCM/APNs)
 *    @capacitor/geolocation               → locatie ophalen
 *    @capacitor-community/background-geolocation  → achtergrond + geofencing
 *    @capacitor/app, @capacitor/splash-screen
 *
 *  In Fase 2 worden ALLEEN de implementaties binnen
 *  src/lib/push.ts, src/lib/geo.ts en src/lib/notify.ts vervangen
 *  door de Capacitor-plugin-varianten. De rest van de app blijft gelijk.
 * ══════════════════════════════════════════════════════════════
 */
export const capacitorConfigPlaceholder = {
  appId: 'app.abdulilia.honeymoon',
  appName: 'Honeymoon HQ',
  webDir: 'dist',
  plugins: {
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    SplashScreen: { launchShowDuration: 1500, backgroundColor: '#1A5C82' },
  },
}
export default capacitorConfigPlaceholder
