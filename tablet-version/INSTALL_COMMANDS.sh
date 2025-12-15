#!/bin/bash

# Installation script for Java JDK and Android Studio
# Run this script with administrator privileges

echo "=== Installing Java JDK and Android Studio ==="

# Step 1: Install Homebrew (if not installed)
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH (for Apple Silicon Macs)
    if [ -f /opt/homebrew/bin/brew ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

# Step 2: Install Java JDK 11
echo "Installing Java JDK 11..."
brew install openjdk@11

# Step 3: Set JAVA_HOME
echo "Setting JAVA_HOME..."
JAVA_HOME_PATH=$(/usr/libexec/java_home -v 11 2>/dev/null || echo "/opt/homebrew/opt/openjdk@11")
echo "export JAVA_HOME=$JAVA_HOME_PATH" >> ~/.zshrc
echo "export PATH=\"\$JAVA_HOME/bin:\$PATH\"" >> ~/.zshrc
export JAVA_HOME=$JAVA_HOME_PATH
export PATH="$JAVA_HOME/bin:$PATH"

# Step 4: Verify Java installation
echo "Verifying Java installation..."
java -version

# Step 5: Download Android Studio (if not already downloaded)
if [ ! -f ~/Downloads/android-studio.dmg ]; then
    echo "Downloading Android Studio..."
    cd ~/Downloads
    curl -L -o android-studio.dmg "https://redirector.gvt1.com/edgedl/android/studio/install/2023.3.1.18/android-studio-2023.3.1.18-mac.dmg"
fi

# Step 6: Instructions for Android Studio
echo ""
echo "=== Installation Steps ==="
echo "1. Java JDK should now be installed"
echo "2. To install Android Studio:"
echo "   - Open ~/Downloads/android-studio.dmg"
echo "   - Drag Android Studio to Applications folder"
echo "   - Launch Android Studio and complete setup wizard"
echo ""
echo "3. After Android Studio is installed, set ANDROID_HOME:"
echo "   echo 'export ANDROID_HOME=\$HOME/Library/Android/sdk' >> ~/.zshrc"
echo "   echo 'export PATH=\"\$ANDROID_HOME/platform-tools:\$PATH\"' >> ~/.zshrc"
echo "   source ~/.zshrc"
echo ""
echo "4. Then build the APK:"
echo "   cd /Users/anjaliagarwal/Documents/servicepro/servicepro-ui-visions/mobile-version"
echo "   npm run cap:open:android"
echo ""









