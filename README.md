# Aether Notes — Premium Workspace Note App

Aether Notes is a production-ready, fully functional rich-text note-taking application built with Next.js 16 (App Router), Tailwind CSS v4, and Firebase v11 (Firestore, Auth, Storage). It features real-time client-side sync with offline support, full folders/tags organization, audio transcribing, note public sharing, and programmatic PDF/ZIP exporting.

---

## Technical Stack
- **Framework:** Next.js 16.2.9 (App Router, Standalone SSR)
- **UI Engine:** React 19 (Strict Mode)
- **Styling:** Tailwind CSS v4 (CSS-first variables, PostCSS)
- **Database, Auth & Storage:** Firebase v11 SDK (Modular API)
- **Rich Editor:** Tiptap v2 (StarterKit, Placeholder, CharacterCount, Tasks, CodeBlockLowlight, Images)
- **Animations:** Framer Motion v11
- **PWA Capabilities:** Web manifest, service worker precaching (`@ducanh2912/next-pwa`)

---

## One-time Firebase setup

### 1. Install Firebase CLI globally
```bash
npm install -g firebase-tools
```

### 2. Log in to your Firebase account
```bash
firebase login
```

### 3. Initialize Firebase in this project directory
Select **Hosting + Firestore + Storage + Functions + Emulators**:
```bash
firebase init
```
*Choose nodejs20 for Functions, use `firestore.rules` and `storage.rules`, and configure public static directories matching Next.js standalone outputs.*

### 4. Link your active Firebase project
```bash
firebase use --add YOUR_PROJECT_ID
```

---

## Enable Firebase Services in Console

1. **Authentication:** Go to Firebase Console → Build → Authentication → Sign-in method. Enable **Email/Password** and **Google OAuth** provider.
2. **Cloud Firestore:** Go to Console → Firestore Database. Click **Create database** and select **Production mode**. Select your regional database location.
3. **Cloud Storage:** Go to Console → Storage. Click **Get started** in **Production mode**.
4. **Firebase Hosting:** Already initialized via `firebase init`.

---

## Local Development

### 1. Install Project Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template and fill in your client configuration parameters obtained from **Firebase Console → Project Settings → General → Web Apps**:
```bash
cp .env.local.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## Firebase Emulators (Local Testing)

Test Firestore security rules, Cloud Storage policies, and auth flows locally without consuming real production quotas.

### 1. Boot up Emulators
```bash
firebase emulators:start
```

### 2. Ports Overview:
- Emulator UI Dashboard: [http://localhost:4000](http://localhost:4000)
- Auth Emulator: [http://localhost:9099](http://localhost:9099)
- Firestore Emulator: [http://localhost:8080](http://localhost:8080)
- Hosting Emulator: [http://localhost:5000](http://localhost:5000)
- Storage Emulator: [http://localhost:9199](http://localhost:9199)
- Functions Emulator: [http://localhost:5001](http://localhost:5001)

### 3. Client Hook-up
To connect client SDKs to local emulators, change your local `.env.local` variable:
```env
NEXT_PUBLIC_USE_EMULATORS=true
```

---

## Custom Domain Setup

1. Go to **Firebase Console → Hosting → Add Custom Domain**.
2. Enter your custom domain address (e.g. `notes.yourdomain.com`).
3. Add the generated DNS values (A records or CNAME records) to your DNS provider control panel.
4. Wait for DNS propagation (takes up to 48 hours). Firebase auto-provisions and configures SSL certificates globally.
5. In **Firebase Console → Authentication → Settings → Authorized domains**, add your custom domain.
6. If using Google Sign-In, go to the **Google Cloud Console → Credentials**, edit your OAuth 2.0 Client ID, and add your custom domain to the **Authorized redirect URIs**.

---

## Deploy to Firebase Hosting

Build the standalone Next.js client, compile the Cloud Function handlers, and release:

### Deploy everything in one command
```bash
npm run deploy
```

### Deploy only Hosting assets (fastest)
```bash
npm run deploy:hosting
```

### Deploy Firestore security rules and indexes
```bash
npm run deploy:rules
npm run deploy:indexes
```

---

## Rollback Strategy

If a deployment introduces issues, you can roll back your environments immediately.

### 1. Hosting rollback
Firebase Hosting retains the last 25 releases automatically. You can roll back instantly:

- **Via CLI:**
  ```bash
  firebase hosting:rollback --project YOUR_PROJECT_ID
  ```
- **Via Console:** Go to **Firebase Console → Hosting → Release History**, find the target stable version, and click **Rollback**.

### 2. Firestore Rules rollback
If you update database rules (`firestore.rules`) and need to revert them:
1. Revert changes in your local `firestore.rules` file (e.g., via Git checkout: `git checkout HEAD~1 firestore.rules`).
2. Redeploy the rules:
   ```bash
   npm run deploy:rules
   ```

### 3. Deploy Tagging Strategy (Git Releases)
Always tag stable releases in Git before deploying:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```
This maps your Git branch commits to active Firebase Hosting releases.
