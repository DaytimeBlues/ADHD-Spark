const { readFileSync } = require('fs');
const { resolve } = require('path');

const storageServicePath = resolve(
  process.cwd(),
  'src/services/StorageService.ts',
);
const source = readFileSync(storageServicePath, 'utf8');

const versionMatch = source.match(/const STORAGE_VERSION = (\d+);/);
const keyMatch = source.match(/const STORAGE_VERSION_KEY = '([^']+)';/);
const migrationMatches = [...source.matchAll(/^\s{2}(\d+): async/gm)];

if (!versionMatch || !keyMatch) {
  console.error('ERROR: unable to read storage migration metadata.');
  process.exit(1);
}

console.log('Admin storage status');
console.log(`Storage version: ${versionMatch[1]}`);
console.log(`Storage version key: ${keyMatch[1]}`);
console.log(
  `Defined migrations: ${migrationMatches.map((match) => match[1]).join(', ') || 'none'}`,
);

process.exit(0);
