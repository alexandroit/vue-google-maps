import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageName = '@stackline/vue-google-maps';

const releaseLines = {
  2: {
    version: '2.0.0',
    vue: '2.7.16',
    peerRange: '>=2.0.0 <3.0.0'
  },
  3: {
    version: '3.0.0',
    vue: '3.5.32',
    peerRange: '>=3.0.0 <4.0.0'
  }
};

function copyDir(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

function run(command, cwd) {
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_yes: 'true'
    }
  });
}

function npmVersionExists(version) {
  try {
    const output = execSync(`npm view ${packageName}@${version} version --json`, {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();

    return output.replace(/^"|"$/g, '') === version;
  } catch (error) {
    return false;
  }
}

function createReleasePackage(line) {
  const release = releaseLines[line];

  if (!release) {
    throw new Error(`Unsupported Vue release line: ${line}`);
  }

  const distDir = path.join(rootDir, 'dist');

  if (!fs.existsSync(distDir)) {
    throw new Error('Build output not found. Run `npm run build` before releasing.');
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `stackline-vue-google-maps-${release.version}-`));
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

  copyDir(distDir, path.join(tempDir, 'dist'));
  fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(tempDir, 'README.md'));
  fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(tempDir, 'LICENSE'));

  packageJson.version = release.version;
  packageJson.description = 'A maintained Vue wrapper for the Google Maps JavaScript API with versioned docs and migration-friendly components.';
  packageJson.peerDependencies.vue = release.peerRange;
  packageJson.devDependencies.vue = release.vue;
  packageJson.publishConfig = {
    ...(packageJson.publishConfig || {}),
    access: 'public'
  };

  fs.writeFileSync(path.join(tempDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);

  return {
    release,
    tempDir
  };
}

export function releaseVueLine(line, options = { publish: true }) {
  const release = releaseLines[line];

  if (!release) {
    throw new Error(`Unsupported Vue release line: ${line}`);
  }

  console.log(`\n=== Vue ${line} · ${release.version} ===`);

  if (options.publish && npmVersionExists(release.version)) {
    console.log(`${packageName}@${release.version} is already published. Skipping npm publish.`);
    return;
  }

  const bundle = createReleasePackage(line);

  run('npm pack', bundle.tempDir);

  if (options.publish) {
    run('npm publish --access public', bundle.tempDir);
    console.log(`Published ${packageName}@${release.version}.`);
  }
}

function parseCli(argv) {
  let line;
  const flags = new Set();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--line') {
      line = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    flags.add(arg);
  }

  if (!line) {
    throw new Error('Usage: node scripts/release-vue-line.js --line <2|3> [--no-publish]');
  }

  return {
    line,
    options: {
      publish: !flags.has('--no-publish')
    }
  };
}

if (path.resolve(process.argv[1] || '') === __filename) {
  const { line, options } = parseCli(process.argv.slice(2));
  releaseVueLine(line, options);
}

export { releaseLines };
