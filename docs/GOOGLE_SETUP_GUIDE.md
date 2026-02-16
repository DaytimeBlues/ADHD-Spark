# Google Services Setup Guide for Spark Focus OS

This guide walks through obtaining the required Google/Firebase configuration files and credentials needed for Google Tasks and Calendar sync functionality.

---

## Prerequisites

- Google account with access to Google Cloud Console and Firebase Console
- Android development environment with `keytool` (comes with JDK)
- Package name: `com.sparkadhd`

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Project name: `Spark Focus OS` (or your preferred name)
4. Accept terms and click **"Continue"**
5. Disable Google Analytics (optional, not required for this app)
6. Click **"Create project"** and wait for completion

---

## Step 2: Add Android App to Firebase Project

1. In your Firebase project dashboard, click the **Android icon** to add an Android app
2. Fill in the registration form:
   - **Android package name**: `com.sparkadhd` (must match exactly)
   - **App nickname**: `Spark ADHD Android` (optional, for your reference)
   - **Debug signing certificate SHA-1**: See "Step 3" below to generate this
3. Click **"Register app"**
4. **Download `google-services.json`**:
   - Firebase will prompt you to download this file
   - Save it to: `android/app/google-services.json` in this repository
   - This file contains your Firebase project configuration
5. Skip the "Add Firebase SDK" steps (already configured in the app)
6. Click **"Continue to console"**

---

## Step 3: Get Android SHA-1 and SHA-256 Fingerprints

Firebase and Google Sign-In require your app's signing certificate fingerprints for security.

### For Debug Builds (Development)

Run this command in your terminal:

```bash
# Windows (PowerShell or cmd)
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### For Release Builds (Production)

If you have a release keystore:

```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

### Extract the Fingerprints

From the output, copy:
- **SHA-1 fingerprint**: Line starting with `SHA1:`
- **SHA-256 fingerprint**: Line starting with `SHA256:`

Example output:
```
Certificate fingerprints:
    SHA1: A1:B2:C3:D4:E5:F6:01:02:03:04:05:06:07:08:09:10:11:12:13:14
    SHA256: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB
```

### Add Fingerprints to Firebase

1. Go back to Firebase Console → Project Settings (gear icon)
2. Scroll down to **"Your apps"** section
3. Find your Android app (`com.sparkadhd`)
4. Click **"Add fingerprint"**
5. Paste the **SHA-1** fingerprint and click **"Save"**
6. Click **"Add fingerprint"** again
7. Paste the **SHA-256** fingerprint and click **"Save"**
8. **Important**: Add BOTH debug and release fingerprints if you have both keystores

---

## Step 4: Enable Google Cloud APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project from the dropdown (it auto-creates a Cloud project)
3. In the left sidebar, go to **"APIs & Services"** → **"Library"**
4. Search for and enable:
   - **Google Tasks API**
   - **Google Calendar API**
5. Click **"Enable"** for each

---

## Step 5: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have a Google Workspace org)
3. Click **"Create"**
4. Fill in required fields:
   - **App name**: `Spark Focus OS`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. **Scopes**: Click **"Add or Remove Scopes"**
   - Search and add: `https://www.googleapis.com/auth/tasks`
   - Search and add: `https://www.googleapis.com/auth/calendar.events`
   - Click **"Update"**
7. Click **"Save and Continue"**
8. **Test users** (optional during development): Add your Google account email
9. Click **"Save and Continue"**
10. Review and click **"Back to Dashboard"**

---

## Step 6: Create OAuth 2.0 Client IDs

### Web Client ID (Required for Android)

Google Sign-In on Android requires a Web client ID for backend authentication.

1. In Google Cloud Console, go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Name: `Spark Focus OS Web Client`
5. **Authorized JavaScript origins** (optional, leave empty for now)
6. **Authorized redirect URIs** (optional, leave empty for now)
7. Click **"Create"**
8. **Copy the Client ID** - this is your `REACT_APP_GOOGLE_WEB_CLIENT_ID`
   - Format: `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`
   - **Save this value** - you'll need it in Step 7

### Android Client ID (Auto-created)

Firebase automatically creates an Android client ID when you add SHA fingerprints. To verify:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Look for an OAuth 2.0 Client ID with type **"Android"**
3. It should show your package name (`com.sparkadhd`) and SHA-1 fingerprint
4. If missing, click **"Create Credentials"** → **"OAuth client ID"** → **"Android"**:
   - Package name: `com.sparkadhd`
   - SHA-1 fingerprint: (paste the one from Step 3)

### iOS Client ID (Optional, for iOS builds)

If you plan to build for iOS:

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. Choose **"iOS"**
3. Bundle ID: `com.sparkadhd` (or your iOS bundle ID)
4. Copy the Client ID - this is your `REACT_APP_GOOGLE_IOS_CLIENT_ID`

---

## Step 7: Set Environment Variables

The app reads Google client IDs from environment variables at build time.

### Option A: `.env` file (Recommended for local development)

Create a file named `.env` in the project root:

```bash
# In: spark-adhd-backup/.env
REACT_APP_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_FROM_STEP_6.apps.googleusercontent.com
REACT_APP_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID_FROM_STEP_6.apps.googleusercontent.com
```

**Replace** `YOUR_WEB_CLIENT_ID_FROM_STEP_6` with the actual Web Client ID you copied in Step 6.

**Note**: The `.env` file is git-ignored for security. Do NOT commit it to version control.

### Option B: System environment variables (Production/CI)

For production builds or CI/CD:

**Windows (PowerShell)**:
```powershell
$env:REACT_APP_GOOGLE_WEB_CLIENT_ID="YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
$env:REACT_APP_GOOGLE_IOS_CLIENT_ID="YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
```

**macOS/Linux**:
```bash
export REACT_APP_GOOGLE_WEB_CLIENT_ID="YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
export REACT_APP_GOOGLE_IOS_CLIENT_ID="YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
```

---

## Step 8: Verify Configuration

After completing all steps, you should have:

- ✅ `android/app/google-services.json` file exists
- ✅ SHA-1 and SHA-256 fingerprints added to Firebase
- ✅ Google Tasks API enabled
- ✅ Google Calendar API enabled
- ✅ OAuth consent screen configured with Tasks + Calendar scopes
- ✅ Web OAuth client ID created
- ✅ Android OAuth client ID exists (auto-created or manual)
- ✅ Environment variable `REACT_APP_GOOGLE_WEB_CLIENT_ID` set
- ✅ (Optional) Environment variable `REACT_APP_GOOGLE_IOS_CLIENT_ID` set for iOS

### Quick Check

Open the Diagnostics screen in the app (available in `__DEV__` mode from Home screen debug panel):

- **Google Web Client ID**: Should show "Configured" ✓
- **Google iOS Client ID**: Should show "Configured" ✓ (if set)
- **Can Attempt Auth**: Should show "Yes" ✓

---

## Troubleshooting

### "API not enabled" error
- Ensure Google Tasks API and Google Calendar API are enabled in Google Cloud Console
- Wait 1-2 minutes after enabling for propagation

### "Sign-in failed: DEVELOPER_ERROR"
- SHA-1/SHA-256 fingerprints don't match your keystore
- Re-run `keytool` command and verify fingerprints in Firebase match exactly
- Make sure you added fingerprints for the correct keystore (debug vs release)

### "Invalid client ID"
- Web Client ID in environment variable doesn't match Google Cloud Console
- Check for copy-paste errors (no extra spaces, complete string)
- Verify the client ID ends with `.apps.googleusercontent.com`

### "Access blocked: This app's request is invalid"
- OAuth consent screen not configured
- Required scopes not added (Tasks + Calendar)
- Go back to Step 5 and verify scopes

### google-services.json not found
- File must be at exact path: `android/app/google-services.json`
- Check file is not named `google-services.json.txt` (Windows hides extensions)
- Verify package name in file matches `com.sparkadhd`

---

## Security Notes

- **Never commit** `google-services.json` to public repositories (it contains Firebase API keys)
- **Never commit** `.env` files with OAuth client IDs to version control
- Use `.gitignore` to exclude:
  ```
  .env
  .env.local
  android/app/google-services.json
  ```
- For open-source projects, provide a `google-services.json.example` template with placeholder values

---

## Production Checklist

Before publishing to Google Play:

- [ ] Generate a **release keystore** (if not already done)
- [ ] Extract SHA-1 and SHA-256 from **release keystore**
- [ ] Add release fingerprints to Firebase
- [ ] Create **release OAuth client ID** in Google Cloud Console
- [ ] Update OAuth consent screen to **"In production"** status
- [ ] Submit app for OAuth verification if using sensitive/restricted scopes
- [ ] Set production environment variables in your build system
- [ ] Test Google Sign-In with release build on real device

---

## Need Help?

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs/android/setup)
2. Check the [Google Sign-In for Android Guide](https://developers.google.com/identity/sign-in/android/start-integrating)
3. Review the Diagnostics screen in the app for specific error codes
4. Check Android logcat for detailed error messages: `adb logcat | grep -i google`

---

**Last Updated**: February 16, 2026  
**App Version**: 1.0.0  
**Package**: com.sparkadhd
