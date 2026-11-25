# Foksijs mācās angliski

Foksijs is an English practice app for Latvian-speaking children. The React app runs on the web and in the Capacitor Android package.

After choosing a child profile, open **Kafejnīcā** from the home screen. Listen to the order, choose a drink, practise the phrase and order something new from a picture. A child can speak aloud and finish with microphone permission denied. Optional recordings stay in memory and are discarded when the child leaves the exercise or backgrounds the app.

Café checkpoints, completion history and practice streaks are stored per profile on the device. The web and Android installations each have their own local progress. The café pictures and audio ship with the Android app. The web version caches them after its first successful service-worker installation.

Each of the 43 units on **Mācības** has eight exercises. In three of them the child listens to English and chooses a written word, matches a sentence to a picture, or chooses a Latvian meaning. The replay button repeats the English recording after the spoken direction. The Android APK bundles the recordings, and the web app caches them with the lesson. The scene scripts are in `src/data/listening-scenes.ts`. [Listening voice credits](public/listening/VOICE-CREDITS.md)

## Run the web app

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Run `npm test`, `npm run lint` and `npm run build` to check the web app.

## Build the Android debug APK

Use JDK 21 and Android SDK Platform 36. Configure the SDK in Android Studio or set `ANDROID_HOME`.

```powershell
npm ci
npm run android:sync
cd android
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
```

On macOS and Linux use `./gradlew`. The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Run `npm run android:sync` after editing web code or lesson assets and before building the next APK.

The café scripts are in `src/features/cafe/cafe_01.json`. Its original illustrations and prerecorded prompts are in `public/cafe/`. [Voice credits](public/cafe/VOICE-CREDITS.md)
