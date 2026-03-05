#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const maxLargestChunkKb = Number(process.env.BUNDLE_MAX_CHUNK_KB || 800);
const maxTotalKb = Number(process.env.BUNDLE_MAX_TOTAL_KB || 3200);

if (!fs.existsSync(distDir)) {
  console.error(`[bundle-size] dist directory not found: ${distDir}`);
  process.exit(1);
}

const bundleFiles = fs
  .readdirSync(distDir)
  .filter((file) => /^bundle\..*\.js$/.test(file));

if (bundleFiles.length === 0) {
  console.error('[bundle-size] No bundle.*.js files found in dist/');
  process.exit(1);
}

const bundles = bundleFiles.map((file) => {
  const fullPath = path.join(distDir, file);
  const sizeBytes = fs.statSync(fullPath).size;
  return { file, sizeBytes, sizeKb: sizeBytes / 1024 };
});

const totalKb = bundles.reduce((sum, b) => sum + b.sizeKb, 0);
const largest = bundles.reduce((a, b) => (a.sizeKb > b.sizeKb ? a : b));

console.log(
  `[bundle-size] bundles=${bundles.length} total=${totalKb.toFixed(
    1,
  )}KB largest=${largest.file} (${largest.sizeKb.toFixed(1)}KB)`,
);
console.log(
  `[bundle-size] limits: largest<=${maxLargestChunkKb}KB total<=${maxTotalKb}KB`,
);

const violations = [];
if (largest.sizeKb > maxLargestChunkKb) {
  violations.push(
    `largest chunk ${largest.file} is ${largest.sizeKb.toFixed(
      1,
    )}KB (limit ${maxLargestChunkKb}KB)`,
  );
}
if (totalKb > maxTotalKb) {
  violations.push(
    `total bundle size is ${totalKb.toFixed(1)}KB (limit ${maxTotalKb}KB)`,
  );
}

if (violations.length > 0) {
  console.error(`[bundle-size] FAILED: ${violations.join('; ')}`);
  process.exit(1);
}

console.log('[bundle-size] OK');
