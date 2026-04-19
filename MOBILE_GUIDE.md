# Mobile App Guide — iOS & Android

## How the Mobile App Works

Family Nudge mobile is built with **React Native + Expo**, which means:
- **One codebase** → runs on both iOS and Android
- **Expo Go** → test instantly on your phone without building (fastest option)
- **EAS Build** → create installable apps (.ipa for iOS, .apk for Android)
- **App Store / Play Store** → publish when ready

---

## Option 1: Test on Your iPhone RIGHT NOW (Expo Go)

This is the fastest way — no build required, takes 2 minutes.

### Steps:

1. **Install "Expo Go" on your iPhone**
   - Open App Store → Search "Expo Go" → Install

2. **Start the dev server** (on your computer):
   ```bash
   cd apps/mobile
   npx expo start
   ```

3. **Scan the QR code**
   - A QR code appears in your terminal
   - Open your iPhone camera and scan it
   - It opens Expo Go with the app running live

4. **That's it!** The app runs on your phone with hot reload.

> **Note:** Your phone and computer must be on the same WiFi network.
> If that's not working, use `npx expo start --tunnel` (requires `ngrok`).

### Limitations of Expo Go:
- No push notification testing (needs a real build)
- No custom native modules
- Fine for development and demo purposes

---

## Option 2: Install on Your iPhone (EAS Build)

This creates a real installable app on your iPhone.

### Free Option — Development Build (Internal Distribution)

1. **Create an Expo account** (free): [expo.dev](https://expo.dev)

2. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **Link the project:**
   ```bash
   cd apps/mobile
   eas init
   ```
   This generates a project ID and updates `app.json`.

4. **Register your iPhone for testing:**
   ```bash
   eas device:create
   ```
   - This gives you a URL to open on your iPhone
   - It installs a provisioning profile (takes 30 seconds)
   - Your device is now registered for internal builds

5. **Build for iOS:**
   ```bash
   eas build --platform ios --profile preview
   ```
   - First build takes ~10-15 minutes (builds in the cloud)
   - No Mac or Xcode required — EAS builds in the cloud
   - Free Expo accounts get 15 iOS builds per month
   - You'll need an Apple Developer account ($0 for testing, $99/year for App Store)

6. **Install on your iPhone:**
   - When the build finishes, you get a download link
   - Open the link on your iPhone
   - Go to Settings → General → VPN & Device Management → Trust the profile
   - The app appears on your home screen!

### For Android:

```bash
eas build --platform android --profile preview
```
- Produces an `.apk` file you can install directly
- No Google Play account needed for testing
- Free, no restrictions

---

## Option 3: Simulator (No Physical Device Needed)

### iOS Simulator (Mac only):
```bash
cd apps/mobile
npx expo start --ios
```
Requires Xcode installed on a Mac.

### Android Emulator (Any OS):
```bash
cd apps/mobile
npx expo start --android
```
Requires Android Studio with an emulator configured.

---

## App Structure

```
apps/mobile/
├── app.json              # Expo config (name, icons, permissions)
├── eas.json              # EAS Build profiles (dev, preview, production)
├── src/
│   ├── app/
│   │   ├── _layout.tsx           # Root navigation stack
│   │   ├── create-reminder.tsx   # Create nudge screen (full form)
│   │   ├── login.tsx             # Login screen
│   │   └── (tabs)/
│   │       ├── _layout.tsx       # Tab bar config
│   │       ├── index.tsx         # Home — stats, upcoming, quick actions
│   │       ├── reminders.tsx     # All reminders with filters
│   │       ├── documents.tsx     # Encrypted document vault
│   │       ├── policies.tsx      # Insurance & warranties
│   │       └── settings.tsx      # Profile, family, notifications
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── store.ts             # Zustand state management
│   └── components/              # Reusable components
└── assets/                      # Icons, splash screen
```

---

## iOS-Specific Features

When running on a real iPhone (not Expo Go), the app supports:

- **Push Notifications** via APNs (Apple Push Notification service)
- **Secure Store** — auth tokens stored in iOS Keychain (encrypted by the OS)
- **Document Picker** — pick files from Files app, iCloud Drive, etc.
- **Haptic Feedback** — for completing reminders, urgent alerts
- **Face ID / Touch ID** — for vault access (coming soon)

---

## Recommended Development Flow

1. **Start with Expo Go** for quick iteration
2. **Switch to EAS Development Build** when you need push notifications
3. **Create EAS Preview Build** to share with family for testing
4. **Submit to App Store / Play Store** when ready for public release

---

## App Store / Play Store Submission

When you're ready to publish:

### iOS (App Store):
- Apple Developer Program membership required ($99/year)
- `eas submit --platform ios`
- EAS handles code signing automatically

### Android (Play Store):
- Google Play Developer account ($25 one-time fee)
- `eas submit --platform android`
- Upload the `.aab` file EAS generates

### Total Publishing Cost:
| Platform | Cost | Frequency |
|----------|------|-----------|
| Apple Developer | $99 | Per year |
| Google Play | $25 | One-time |
| EAS Build | $0 | Free tier (15 iOS + 15 Android builds/month) |
