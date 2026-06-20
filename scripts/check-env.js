#!/usr/bin/env node

/**
 * Pre-deploy environment validation script.
 * Ensures all required Firebase env vars are set and not placeholders before building.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const PLACEHOLDER_PATTERNS = [
  'your_',
  'YOUR_',
  'fake-',
  'mock-',
  'demo-',
  'example',
  '000000000000',
  '1234567890',
];

// Load .env.production.local if it exists
const envFile = path.join(process.cwd(), '.env.production.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
  console.log('✓ Loaded .env.production.local\n');
}

let hasErrors = false;

console.log('🔍 Checking required environment variables...\n');

for (const varName of REQUIRED_VARS) {
  const value = process.env[varName];

  if (!value) {
    console.error(`  ❌ ${varName} is missing`);
    hasErrors = true;
    continue;
  }

  const isPlaceholder = PLACEHOLDER_PATTERNS.some((p) => value.includes(p));
  if (isPlaceholder) {
    console.error(`  ❌ ${varName} still has a placeholder value: "${value}"`);
    hasErrors = true;
    continue;
  }

  console.log(`  ✅ ${varName}`);
}

// Check NEXT_PUBLIC_USE_EMULATORS is not true in production
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS;
if (useEmulators === 'true') {
  console.error('\n  ❌ NEXT_PUBLIC_USE_EMULATORS=true — must be "false" for production!');
  hasErrors = true;
} else {
  console.log('  ✅ NEXT_PUBLIC_USE_EMULATORS is not "true"');
}

console.log('');

if (hasErrors) {
  console.error('──────────────────────────────────────────────');
  console.error('🚨 Deploy blocked: Fix the errors above first.');
  console.error('   Create a .env.production.local file with');
  console.error('   real Firebase credentials from the console.');
  console.error('   See .env.production.local.example for the template.');
  console.error('──────────────────────────────────────────────\n');
  process.exit(1);
} else {
  console.log('──────────────────────────────────────────────');
  console.log('✅ All environment checks passed! Proceeding...');
  console.log('──────────────────────────────────────────────\n');
}
