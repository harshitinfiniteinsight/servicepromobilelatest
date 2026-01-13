# Quick Installation Guide

## ✅ Downloads Complete

Both installers have been downloaded:
- **Java JDK**: `/tmp/openjdk-11.pkg` (180MB)
- **Android Studio**: `~/Downloads/android-studio.dmg` (170MB)

## Step 1: Install Java JDK

Run this command in Terminal (will prompt for your password):

```bash
sudo installer -pkg /tmp/openjdk-11.pkg -target /
```

After installation, verify:
```bash
java -version
```

If Java is not found, set JAVA_HOME:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
export PATH="$JAVA_HOME/bin:$PATH"
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 11)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Step 2: Install Android Studio

1. **Open the DMG file:**
   ```bash
   open ~/Downloads/android-studio.dmg
   ```

2. **Drag Android Studio to Applications:**
   - In the Finder window that opens, drag "Android Studio.app" to the Applications folder

3. **Launch Android Studio:**
   - Open Applications folder
   - Double-click "Android Studio"
   - Follow the setup wizard
   - Accept licenses when prompted
   - Let it download Android SDK components

4. **Set ANDROID_HOME** (after Android Studio setup completes):
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
   echo 'export PATH="$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

## Step 3: Build the APK

Once both are installed:

```bash
cd /Users/anjaliagarwal/Documents/servicepro/servicepro-ui-visions/mobile-version

# Verify Java works
java -version

# Open Android project
npm run cap:open:android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Find APK at: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Alternative: Build via Command Line

```bash
cd /Users/anjaliagarwal/Documents/servicepro/servicepro-ui-visions/mobile-version/android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Troubleshooting

- **Java not found**: Make sure you've run the installer and set JAVA_HOME
- **Gradle fails**: Ensure Android SDK is installed via Android Studio
- **Build errors**: Try `./gradlew clean` then rebuild









