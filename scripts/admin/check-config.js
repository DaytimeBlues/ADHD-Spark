const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

const cwd = process.cwd();
const envExamplePath = resolve(cwd, '.env.example');

const diagnostics = [];

const addDiagnostic = (severity, message) => {
  diagnostics.push({ severity, message });
};

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://spark-adhd-api.vercel.app';
if (!isValidUrl(apiBaseUrl)) {
  addDiagnostic(
    'error',
    'EXPO_PUBLIC_API_BASE_URL must be a valid http or https URL.',
  );
}

if (
  !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID &&
  !process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
) {
  addDiagnostic(
    'warn',
    'Google client IDs are missing. Google sync features will remain disabled.',
  );
}

if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
  addDiagnostic(
    'warn',
    'EXPO_PUBLIC_GEMINI_API_KEY is public in the client bundle. Prefer the Vercel backend for production.',
  );
}

if (process.env.EXPO_PUBLIC_MOONSHOT_API_KEY) {
  addDiagnostic(
    'warn',
    'EXPO_PUBLIC_MOONSHOT_API_KEY is public in the client bundle. Prefer the Vercel backend for production.',
  );
}

if (!existsSync(envExamplePath)) {
  addDiagnostic('error', '.env.example is missing.');
} else {
  const contents = readFileSync(envExamplePath, 'utf8');
  ['client-public', 'server-only', 'optional'].forEach((label) => {
    if (!contents.includes(label)) {
      addDiagnostic(
        'error',
        `.env.example is missing the '${label}' labeling convention.`,
      );
    }
  });
}

console.log('Admin config check');
console.log(`API base URL: ${apiBaseUrl}`);

if (diagnostics.length === 0) {
  console.log('PASS: no config diagnostics found.');
  process.exit(0);
}

diagnostics.forEach((diagnostic) => {
  console.log(`${diagnostic.severity.toUpperCase()}: ${diagnostic.message}`);
});

process.exit(diagnostics.some((item) => item.severity === 'error') ? 1 : 0);
