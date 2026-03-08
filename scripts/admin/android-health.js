const { existsSync } = require('fs');
const { resolve } = require('path');

console.log('Admin android health');

const requiredFiles = [
  'android/gradlew.bat',
  'scripts/check_android_health.bat',
];
const missing = requiredFiles.filter(
  (relativePath) => !existsSync(resolve(process.cwd(), relativePath)),
);

if (missing.length > 0) {
  missing.forEach((path) => console.error(`ERROR: missing ${path}`));
  process.exit(1);
}

console.log('PASS: Android health entrypoints are present.');
console.log(
  'Run scripts/check_android_health.bat on Windows for the full environment check.',
);
process.exit(0);
