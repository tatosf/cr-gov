import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeBinDir = path.dirname(process.execPath);
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');

process.env.PATH = `${nodeBinDir}:${process.env.PATH || '/usr/local/bin:/usr/bin:/bin'}`;

// Use --webpack to avoid Turbopack's `node` PATH issue with nvm
const child = spawn(process.execPath, [nextBin, 'dev', '--webpack'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 1));
