# Google & Firebase Project Setup — ADHD-CADDI

> **Status:** Project not yet created in Google Cloud / Firebase.
> **Your Web Client ID (already obtained):** `474078142013-dftko9eohdbbmoeg407sr99qesm3ptlq.apps.googleusercontent.com`
> Work through this guide top to bottom to get everything connected.

---

## What You Already Have

| Item | Status | Value |
|---|---|---|
| Web Client ID | ✅ Done | `474078142013-dftko9eohdbbmoeg407sr99qesm3ptlq.apps.googleusercontent.com` |
| Google Cloud project | ❌ Not created yet | — |
| Firebase project | ❌ Not created yet | — |
| `android/app/google-services.json` | ❌ Not created yet | — |
| OAuth consent screen | ❓ Check if configured | — |
| Tasks API enabled | ❓ Check | — |
| Calendar API enabled | ❓ Check | — |
| SHA fingerprints registered | ❌ Not done yet | — |

> **Note:** Your Web Client ID starts with `474078142013-` which is your Google Cloud **Project Number**.
> This means a Google Cloud project already exists with project number **474078142013**.
> You just need to find it (or link Firebase to it).

---

## Step 1 — Find Your Existing Google Cloud Project

Because you already have a Web Client ID, a Google Cloud project already exists.

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the **project dropdown** at the top (next to the Google Cloud logo)
4. Look for a project with number **474078142013**
5. Select it — this is the project your Client ID belongs to

If you cannot find it, check you are signed in with the correct Google account.

---

## Step 2 — Enable the Required APIs

Once you are in the correct project:

1. Go to **APIs & Services → Library**
2. Search for and enable each of these:

| API | Search Term | Why |
|---|---|---|
| Google Tasks API | `Tasks API` | Tasks sync |
| Google Calendar API | `Calendar API` | Calendar sync |

Click **Enable** on each one. Google Sign-In (OpenID Connect) is always available and does not need a separate enable step.

---

## Step 3 — Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. If it is not yet configured, click **Get started** or **Configure consent screen**
3. Fill in:
   - **App name:** `ADHD-CADDI`
   - **User support email:** your Google email
   - **Developer contact email:** your Google email
4. Click **Next: Scopes**
5. Click **Add or remove scopes** and add:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/tasks`
   - `https://www.googleapis.com/auth/calendar.events`
6. Click **Next: Test users**
7. Add your own Gmail address as a test user
8. Click **Save and continue**

> If the app is in **Testing** mode, only test users can sign in. That is fine for now.
> You can publish it later when you're ready to share with family/friends.

---

## Step 4 — Create a Firebase Project (and Link to Your Google Cloud Project)

Firebase is where you register the Android app and get `google-services.json`.

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add project**
3. At the **"Enter your project name"** step:
   - Type `ADHD-CADDI` in the search box
   - It should detect your existing Google Cloud project with number **474078142013**
   - Select it if it appears, OR type a new name and Firebase will create a new linked project
4. Enable **Google Analytics** if you want (optional — can skip for now)
5. Click **Create project**
6. Wait for it to finish → click **Continue**

---

## Step 5 — Add Your Android App to Firebase

In the Firebase project you just created:

1. Click the **Android icon** (or **Add app → Android**) on the Project Overview page
2. Fill in:
   - **Android package name:** `com.adhdcaddi`
   - **App nickname:** `ADHD-CADDI Android`
   - **Debug signing certificate SHA-1:** leave blank for now (you will add this in Step 7)
3. Click **Register app**
4. Click **Download google-services.json**
5. Save the file — you will place it at:
   ```
   android/app/google-services.json
   ```
   in your local project
6. Click **Next** through the remaining steps (the Gradle config is already set up in your repo)
7. Click **Continue to console**

---

## Step 6 — Add the File to Your Local Project

On your computer:

1. Move the downloaded `google-services.json` to:
   ```
   ADHD-CADDI/android/app/google-services.json
   ```
2. This file is already in `.gitignore` so it will NOT be committed to GitHub (correct — it should stay local)
3. For CI/GitHub Actions, you will store it as a base64-encoded GitHub secret (covered later)

---

## Step 7 — Get Your SHA Fingerprints and Register Them

Android Google Sign-In will silently fail unless your SHA fingerprints are registered in Firebase.

### Get Your SHA-1 and SHA-256

In your project folder, run:

```bash
cd android && ./gradlew signingReport
```

Look for the **debug** variant output:

```
Variant: debug
Config: debug
Store: /Users/yourname/.android/debug.keystore
Alias: AndroidDebugKey
SHA1:   AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
SHA-256: 11:22:33:...
```

Copy both values.

### Register in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project
2. Click the **gear icon** → **Project settings**
3. Scroll to **Your apps** → find the Android app (`com.adhdcaddi`)
4. Click **Add fingerprint**
5. Paste your **SHA-1** → click **Save**
6. Click **Add fingerprint** again
7. Paste your **SHA-256** → click **Save**
8. **Download a fresh `google-services.json`** after adding fingerprints (Firebase updates the file with the new fingerprint)
9. Replace the old file at `android/app/google-services.json` with the new download

---

## Step 8 — Wire Up the Client ID in Your .env File

In your local project, create or edit `.env` (copy from `.env.example` if you haven't already):

```bash
cp .env.example .env
```

Then open `.env` and set:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=474078142013-dftko9eohdbbmoeg407sr99qesm3ptlq.apps.googleusercontent.com
```

Leave `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` blank for now (you can add it later if you build for iPhone).

---

## Step 9 — Test Google Sign-In on Web

```bash
npm run web
```

Open [http://localhost:3000](http://localhost:3000) and try signing in with Google.

If you see an error:
- **`redirect_uri_mismatch`** → go back to Cloud Console → Credentials → your Web Client → add `http://localhost:3000` to Authorized redirect URIs
- **`access_blocked`** → your OAuth consent screen is in Testing mode — add your Gmail as a test user (Step 3)
- **`invalid_client`** → double-check the Client ID in `.env` matches exactly

---

## Step 10 — Test on Android Phone

```bash
npm run install:android:preview
```

The app will build and install on your connected Android phone.

If Google Sign-In fails on Android but works on web:
- You likely need to add SHA fingerprints (Step 7) and re-download `google-services.json`

---

## Step 11 — Set Up Firebase App Distribution (For Family/Friends)

Once sign-in works on your own phone:

1. Go to [Firebase Console](https://console.firebase.google.com/) → **App Distribution**
2. Click **Get started**
3. Build a release APK:
   ```bash
   npm run build:android:preview
   ```
4. Upload the APK to Firebase App Distribution
5. Add tester emails (family/friends)
6. Click **Distribute**
7. Testers receive an email with instructions to download and install

---

## Summary Checklist

- [x] Web Client ID obtained: `474078142013-dftko9eohdbbmoeg407sr99qesm3ptlq.apps.googleusercontent.com`
- [ ] Found Google Cloud project number 474078142013 in Cloud Console
- [ ] Google Tasks API enabled
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured with correct scopes
- [ ] Your Gmail added as a test user
- [ ] Firebase project created and linked to Cloud project
- [ ] Android app registered in Firebase with package `com.adhdcaddi`
- [ ] `google-services.json` downloaded and placed at `android/app/google-services.json`
- [ ] SHA-1 fingerprint registered in Firebase
- [ ] SHA-256 fingerprint registered in Firebase
- [ ] Fresh `google-services.json` downloaded after fingerprint registration
- [ ] `.env` created with `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` set
- [ ] Google Sign-In tested on web (`npm run web`)
- [ ] Google Sign-In tested on Android phone
- [ ] Firebase App Distribution set up for family/friends

---

## Your Key IDs Reference

| Item | Value |
|---|---|
| Google Cloud Project Number | `474078142013` |
| Web Client ID | `474078142013-dftko9eohdbbmoeg407sr99qesm3ptlq.apps.googleusercontent.com` |
| Android Package Name | `com.adhdcaddi` |
| iOS Bundle ID (future) | `com.adhdcaddi` |

---

*Last updated: March 2026 — ADHD-CADDI project by DaytimeBlues*
