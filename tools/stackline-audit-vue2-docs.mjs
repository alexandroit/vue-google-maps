import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const docsDirectory = process.argv[2];

if (!docsDirectory) {
  throw new Error('Usage: stackline-audit-vue2-docs.mjs <docs-directory>');
}

const audit = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['audit', '--json', '--prefix', resolve(docsDirectory)],
  { encoding: 'utf8' }
);

if (audit.error) {
  throw audit.error;
}

let report;

try {
  report = JSON.parse(audit.stdout);
} catch {
  throw new Error(`npm audit did not return JSON: ${audit.stderr || audit.stdout}`);
}

if (report.error) {
  throw new Error(`npm audit failed: ${report.error.summary || report.error.code}`);
}

const vulnerabilities = report.vulnerabilities || {};
const approved = new Set();
const advisoryUrl = 'https://github.com/advisories/GHSA-5j4c-8p2g-v4jx';

function isApprovedRootAdvisory(via) {
  return (
    typeof via === 'object' &&
    via !== null &&
    via.source === 1100238 &&
    via.url === advisoryUrl &&
    via.severity === 'low'
  );
}

function hasNoCompatibleFix(fixAvailable) {
  return (
    fixAvailable === false ||
    (typeof fixAvailable === 'object' &&
      fixAvailable !== null &&
      fixAvailable.isSemVerMajor === true)
  );
}

let changed = true;

while (changed) {
  changed = false;

  for (const [name, finding] of Object.entries(vulnerabilities)) {
    if (approved.has(name)) {
      continue;
    }

    const via = Array.isArray(finding.via) ? finding.via : [];
    const onlyApprovedPaths =
      via.length > 0 &&
      via.every((item) =>
        typeof item === 'string' ? approved.has(item) : isApprovedRootAdvisory(item)
      );

    if (
      finding.severity === 'low' &&
      hasNoCompatibleFix(finding.fixAvailable) &&
      onlyApprovedPaths
    ) {
      approved.add(name);
      changed = true;
    }
  }
}

const unexpected = Object.keys(vulnerabilities).filter((name) => !approved.has(name));

if (unexpected.length > 0) {
  throw new Error(
    `Unexpected Vue 2 audit findings: ${unexpected.join(', ')}. ` +
      'Only the unfixed Vue 2 parseHTML advisory is accepted.'
  );
}

if (approved.size === 0) {
  console.log('Vue 2 documentation audit passed with no vulnerabilities.');
} else {
  console.log(
    `Vue 2 documentation audit accepted only ${advisoryUrl} ` +
      `through: ${[...approved].join(', ')}.`
  );
}
