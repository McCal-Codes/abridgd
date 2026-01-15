#!/usr/bin/env node

/**
 * Repo Health Audit
 * 
 * Checks for common repo hygiene issues:
 * - No scripts in scripts/ root (all should be in subdirectories)
 * - No accidentally committed node_modules (paranoia)
 * - Essential docs exist (standards, changelog, readme)
 * 
 * Run: node scripts/audit/repo-health.js
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let issueCount = 0;
let warningCount = 0;

function error(msg) {
   process.stdout.write(`${RED}❌ ERROR:${RESET} ${msg}\n`);
  issueCount++;
}

function warning(msg) {
   process.stdout.write(`${YELLOW}⚠️  WARNING:${RESET} ${msg}\n`);
  warningCount++;
}

function success(msg) {
   process.stdout.write(`${GREEN}✓${RESET} ${msg}\n`);
}

const projectRoot = path.resolve(__dirname, '../../');

  process.stdout.write(`\n📋 Repo Health Audit\n${'='.repeat(50)}\n\n`);

// 1. Check for scripts in scripts/ root
  process.stdout.write('1. Scripts Organization:\n');
const scriptsDir = path.join(projectRoot, 'scripts');
const scriptsRoot = fs.readdirSync(scriptsDir)
  .filter(file => fs.statSync(path.join(scriptsDir, file)).isFile())
  .filter(file => ['.js', '.sh'].includes(path.extname(file)))
  .filter(file => file !== '.gitkeep' && file !== 'README.md');

if (scriptsRoot.length === 0) {
  success('No loose scripts in scripts/ root');
} else {
  error(`Found ${scriptsRoot.length} script(s) in scripts/ root: ${scriptsRoot.join(', ')}`);
}

// 2. Check for inadvertently committed node_modules
  process.stdout.write('\n2. Git Hygiene:\n');
const gitignorePath = path.join(projectRoot, '.gitignore');
const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
if (gitignore.includes('node_modules')) {
  success('node_modules/ is in .gitignore');
} else {
  error('node_modules/ is NOT in .gitignore!');
}

// 3. Check for essential documentation
  process.stdout.write('\n3. Essential Documentation:\n');
const essentialDocs = [
  ['README.md', 'Project overview'],
  ['CHANGELOG.md', 'Release notes'],
  ['docs/standards/README.md', 'Standards overview'],
  ['docs/standards/engineering.md', 'Engineering standards'],
  ['scripts/README.md', 'Scripts documentation'],
  ['.editorconfig', 'Editor formatting rules'],
];

essentialDocs.forEach(([file, desc]) => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    success(`${desc} (${file})`);
  } else {
    warning(`Missing: ${desc} (${file})`);
  }
});

// 4. Check for TypeScript config
  process.stdout.write('\n4. Tooling Configuration:\n');
const tsconfig = path.join(projectRoot, 'tsconfig.json');
const jest = path.join(projectRoot, 'jest.config.js');
const babel = path.join(projectRoot, 'babel.config.js');

[
  [tsconfig, 'TypeScript config'],
  [jest, 'Jest config'],
  [babel, 'Babel config'],
].forEach(([file, name]) => {
  if (fs.existsSync(file)) {
    success(`${name} exists`);
  } else {
    warning(`Missing: ${name}`);
  }
});

// 5. Check for required subdirectories in src/
  process.stdout.write('\n5. Source Code Structure:\n');
const srcDir = path.join(projectRoot, 'src');
const requiredDirs = [
  'shared/ui',
  'shared/testing',
  'components',
  'screens',
  'services',
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(srcDir, dir);
  if (fs.existsSync(fullPath)) {
    success(`src/${dir}/ exists`);
  } else {
    warning(`Missing: src/${dir}/`);
  }
});

// Summary
  process.stdout.write(`\n${'='.repeat(50)}\n`);
const allClear = issueCount === 0 && warningCount === 0;
if (allClear) {
   process.stdout.write(`\n${GREEN}✓ All checks passed!${RESET}\n\n`);
} else {
   process.stdout.write(`\n${issueCount} error(s), ${warningCount} warning(s)\n\n`);
}

process.exit(issueCount > 0 ? 1 : 0);
