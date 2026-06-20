# 🚀 Deployment Guide — Aether Notes

Complete step-by-step guide to deploy this app to Firebase Hosting + Cloud Functions.

---

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A **Firebase project** with the **Blaze (pay-as-you-go)** plan  
  *(Cloud Functions requires Blaze — you won't be charged unless you exceed the free quota)*

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → enter a name → continue
3. Upgrade to **Blaze plan**: Project Settings → Usage and billing → Modify plan

---

## Step 2 — Enable Required Firebase Services

### Authentication
- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password**

### Firestore Database
- Go to **Firestore Database** → **Create database**
- Choose **Production mode**
- Select a region closest to your users

### Cloud Storage
- Go to **Storage** → **Get started**
- Choose **Production mode**
- Select the same region as Firestore

---

## Step 3 — Get Your Firebase Config

1. Go to **Project Settings** (gear icon) → **Your apps**
2. Click **Add app** → Web
3. Register the app → copy the config values

---

## Step 4 — Set Up Production Environment Variables

```bash
cp .env.production.local.example .env.production.local
```

Edit `.env.production.local` with your real values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_USE_EMULATORS=false
```

---

## Step 5 — Connect Firebase CLI to Your Project

```bash
firebase login
firebase use --add   # select your project, alias it "default"
```

Or edit `.firebaserc` directly:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

---

## Step 6 — Deploy Rules & Indexes First

```bash
npm run deploy:rules
npm run deploy:indexes
```

---

## Step 7 — Full Deployment

```bash
npm run deploy
```

This will automatically:
1. ✅ Validate all env vars (`scripts/check-env.js`)
2. ✅ Build Next.js production bundle
3. ✅ Deploy Hosting + Functions + Firestore rules + Storage rules

---

## All Commands

| Command | Description |
|---|---|
| `npm run deploy` | Full deploy |
| `npm run deploy:hosting` | Hosting + Functions only |
| `npm run deploy:rules` | Firestore + Storage rules |
| `npm run deploy:indexes` | Firestore indexes |
| `npm run emulators` | Local emulators with data persistence |
| `npm run emulators:fresh` | Local emulators, clean state |
| `npm run emulators:ui` | Open Emulator UI |

---

## Troubleshooting

| Error | Fix |
|---|---|
| `firebase: command not found` | `npm install -g firebase-tools` |
| `Functions require Blaze plan` | Upgrade project at Firebase Console → Billing |
| `auth/api-key-not-valid` | Check `.env.production.local` has real keys |
| `NEXT_PUBLIC_USE_EMULATORS=true` error | Set to `false` in `.env.production.local` |
