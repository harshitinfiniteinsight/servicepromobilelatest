# Android APK Build Setup Guide

## Prerequisites

To build the Android APK, you need to install:

1. **Java JDK (version 11 or higher)**
2. **Android Studio** (includes Android SDK and Gradle)

## Step 1: Install Java JDK

### Option A: Using Homebrew (Recommended)

1. Install Homebrew (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install OpenJDK 11:
   ```bash
   brew install openjdk@11
   ```

3. Set JAVA_HOME:
   ```bash
   echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 11)' >> ~/.zshrc
   echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

### Option B: Manual Installation

1. Download JDK from Oracle:
   - Visit: https://www.oracle.com/java/technologies/downloads/#java11
   - Download macOS installer (.dmg)
   - Install the package

2. Set JAVA_HOME:
   ```bash
   echo 'export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home' >> ~/.zshrc
   echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Verify installation:
   ```bash
   java -version
   ```

## Step 2: Install Android Studio

1. Download Android Studio:
   - Visit: https://developer.android.com/studio
   - Download the macOS version
   - Open the .dmg file and drag Android Studio to Applications

2. Launch Android Studio:
   - First launch will set up Android SDK
   - Follow the setup wizard
   - Accept licenses when prompted

3. Set ANDROID_HOME (if not automatically set):
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
   echo 'export PATH="$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

## Step 3: Build the APK

Once Java JDK and Android Studio are installed:

### Method 1: Using Command Line

```bash
cd /Users/anjaliagarwal/Documents/servicepro/servicepro-ui-visions/mobile-version
npm run build
npm run cap:sync
cd android
./gradlew assembleRelease
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Method 2: Using Android Studio

1. Open Android Studio
2. Click "Open" and navigate to:
   `/Users/anjaliagarwal/Documents/servicepro/servicepro-ui-visions/mobile-version/android`
3. Wait for Gradle sync to complete
4. Go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. Wait for build to complete
6. Click "locate" in the notification or find APK at:
   `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Step 4: Sign the APK (Optional, for distribution)

For Google Play Store or production distribution, you'll need to sign the APK:

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore servicepro-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias servicepro
   ```

2. Configure signing in `android/app/build.gradle` (add signingConfigs)

## Current Status

✅ **Frontend built successfully** - Production build in `dist/` folder
✅ **Capacitor synced** - Web assets copied to Android project
✅ **Dummy data included** - All mock data from `mobileMockData.ts` is ready
⏳ **Waiting for** - Java JDK and Android Studio installation

## Troubleshooting

### If Gradle build fails:
- Make sure Java JDK is properly installed and JAVA_HOME is set
- Check Android SDK is installed via Android Studio
- Try: `cd android && ./gradlew clean` then rebuild

### If Capacitor sync fails:
- Make sure you've run `npm run build` first
- Check that `dist` folder exists

### If APK is not generated:
- Check build logs in Android Studio
- Verify all dependencies are installed
- Try cleaning the project: `./gradlew clean`

## Next Steps After APK is Built

1. **Test on device**: Transfer APK to Android device and install
2. **Test functionality**: Verify all features work with dummy data
3. **Sign APK**: For production distribution
4. **Upload to Play Store**: If ready for release









