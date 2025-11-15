# WatchWhistle iOS App Store Deployment Guide

## ✅ What's Been Done

1. **Capacitor Installed** - Your React web app is now wrapped in a native iOS container
2. **iOS Project Created** - Located at `/app/frontend/ios/`
3. **App Built & Synced** - Production build copied to iOS project

---

## 📋 What You Need

### 1. Hardware & Software
- **Mac computer** (required for iOS development)
- **Xcode** (free from Mac App Store)
- **Apple Developer Account** ($99/year) - https://developer.apple.com

### 2. The iOS Project Files
You need to transfer the `/app/frontend/ios/` folder to your Mac.

**Options to get files:**
- Download project as ZIP from Emergent
- Use Git to clone the repository
- Use SCP/SFTP to transfer files

---

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Your Mac

1. **Install Xcode**
   ```bash
   # Open Mac App Store and search for "Xcode"
   # Or download from developer.apple.com
   ```

2. **Install CocoaPods** (dependency manager)
   ```bash
   sudo gem install cocoapods
   ```

3. **Sign up for Apple Developer Program**
   - Go to https://developer.apple.com
   - Enroll ($99/year)
   - Wait for approval (usually 24-48 hours)

### Step 2: Open Project in Xcode

1. **Navigate to the iOS folder**
   ```bash
   cd /path/to/watchwhistle/frontend/ios
   ```

2. **Install iOS dependencies**
   ```bash
   pod install
   ```

3. **Open in Xcode**
   ```bash
   open App/App.xcworkspace
   ```
   ⚠️ Important: Open `.xcworkspace`, NOT `.xcodeproj`

### Step 3: Configure App in Xcode

1. **Select the App target** (left sidebar)

2. **Signing & Capabilities tab**
   - Team: Select your Apple Developer account
   - Bundle Identifier: `com.watchwhistle.app`
   - Signing Certificate: Automatic

3. **General tab**
   - Display Name: `WatchWhistle`
   - Bundle Identifier: `com.watchwhistle.app`
   - Version: `1.0`
   - Build: `1`
   - Minimum Deployments: iOS 13.0

4. **Add App Icons**
   - Assets.xcassets → AppIcon
   - Drag your app icons (1024x1024, 180x180, 120x120, etc.)
   - Use a tool like https://appicon.co to generate all sizes

### Step 4: Test on Simulator

1. **Select iPhone simulator** from top menu (e.g., "iPhone 15 Pro")
2. **Click the Play button** (⌘+R) to build and run
3. **Test your app** in the simulator

### Step 5: Test on Real iPhone

1. **Connect your iPhone** via USB
2. **Trust the computer** on your iPhone
3. **Select your iPhone** from devices menu
4. **Run the app** (⌘+R)
5. **Trust developer** on iPhone (Settings → General → VPN & Device Management)

### Step 6: Prepare for App Store

1. **Create App Store Connect Listing**
   - Go to https://appstoreconnect.apple.com
   - Click "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: WatchWhistle
   - Primary Language: English
   - Bundle ID: com.watchwhistle.app
   - SKU: watchwhistle001

2. **Fill Required Information**
   - App name
   - Subtitle (optional)
   - Category: Entertainment or Lifestyle
   - Age Rating
   - Privacy Policy URL (you'll need to create this)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

3. **Upload Screenshots**
   Required sizes:
   - 6.7" iPhone (1290 x 2796) - 3 minimum
   - 6.5" iPhone (1242 x 2688) - 3 minimum
   - 5.5" iPhone (1242 x 2208) - 3 minimum
   
   Use iPhone simulators or real devices to take screenshots

### Step 7: Archive and Upload

1. **Select "Any iOS Device"** from devices menu

2. **Archive the app**
   - Product → Archive (⌘+Shift+B)
   - Wait for build to complete

3. **Upload to App Store**
   - Window → Organizer
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Upload
   - Wait for processing (~15-30 minutes)

4. **Submit for Review**
   - Go back to App Store Connect
   - Select your app
   - Under "Build", select the uploaded version
   - Fill out "App Review Information"
   - Submit for Review

### Step 8: Wait for Review

- **First review**: 1-7 days (often rejected first time)
- **Common rejection reasons**:
  - Missing privacy policy
  - Incomplete app information
  - Bugs or crashes
  - Not enough features
  - UI issues

- **If rejected**: Fix issues and resubmit
- **If approved**: Your app goes live! 🎉

---

## 📱 Required Documents

### 1. Privacy Policy
Create at: https://www.privacypolicygenerator.info/

**Must include:**
- What data you collect (user email, show preferences)
- How you use it (personalization, notifications)
- Third-party services (Google OAuth, TVMaze API)
- User rights (access, deletion)
- Contact information

### 2. Terms of Service
Create at: https://www.termsfeed.com/terms-service-generator/

**Must include:**
- User responsibilities
- Account termination
- Intellectual property
- Disclaimer
- Contact information

### 3. Support Page
Create a simple webpage with:
- Contact email: support@watchwhistle.com
- FAQ section
- Bug report instructions

---

## 💡 Tips for Success

1. **Test Thoroughly**
   - Test on multiple iPhone models
   - Test offline mode
   - Test all features
   - Fix all crashes

2. **Polish the UI**
   - Make sure everything looks good on different screen sizes
   - Add loading states
   - Handle errors gracefully

3. **Prepare Demo Account**
   - Apple reviewers need a working account
   - Provide test credentials in App Review Information

4. **Be Patient**
   - First submission often gets rejected
   - Learn from feedback and improve
   - Most apps get approved after 2-3 submissions

---

## 🔧 Updating the App

When you want to release updates:

1. **Make changes** to your React code
2. **Build**: `yarn build`
3. **Sync**: `npx cap sync ios`
4. **Open Xcode**
5. **Increment version** or build number
6. **Archive and upload** (same as Step 7)
7. **Submit for review**

---

## 📞 Need Help?

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Xcode Help**: https://developer.apple.com/support/xcode/
- **App Store Connect**: https://developer.apple.com/support/app-store-connect/
- **Stack Overflow**: Search "Capacitor iOS" for common issues

---

## ⚠️ Important Notes

1. **Backend URL**: Make sure `REACT_APP_BACKEND_URL` in `.env` points to your production backend (not localhost)

2. **Authentication**: You'll need to update OAuth redirect URLs when you have your production domain

3. **Push Notifications**: Requires additional setup (not currently configured)

4. **Analytics**: Consider adding analytics (Google Analytics, Mixpanel, etc.)

---

Good luck with your App Store submission! 🚀📱
