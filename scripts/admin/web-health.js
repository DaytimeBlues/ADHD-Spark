const { existsSync } = require('fs');
const { resolve } = require('path');

const requiredFiles = [
  'webpack.config.js',
  'playwright.config.ts',
  'e2e/smoke-basic.spec.ts',
];

console.log('Admin web health');

const missing = requiredFiles.filter(
  (relativePath) => !existsSync(resolve(process.cwd(), relativePath)),
);

if (missing.length > 0) {
  missing.forEach((path) => console.error(`ERROR: missing ${path}`));
  process.exit(1);
}

console.log('PASS: web health entrypoints are present.');
process.exit(0);
