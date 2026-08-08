import net from 'node:net';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const apiRoot = resolve(import.meta.dirname, '..');

function readPort() {
  if (process.env.PORT) {
    return Number(process.env.PORT);
  }

  const envPath = resolve(apiRoot, '.env');
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, 'utf8').match(/^\s*PORT\s*=\s*["']?(\d+)/m);
    if (match) {
      return Number(match[1]);
    }
  }

  return 3030;
}

function isPortInUse(port) {
  return new Promise((resolveResult) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolveResult(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolveResult(false);
    });
  });
}

const port = readPort();

if (await isPortInUse(port)) {
  console.log(`[api] Already running at http://localhost:${port}; reusing the existing process.`);
  process.exit(0);
}

const nestCli = resolve(apiRoot, 'node_modules/@nestjs/cli/bin/nest.js');
const child = spawn(process.execPath, [nestCli, 'start', '--watch'], {
  cwd: apiRoot,
  stdio: 'inherit',
  shell: false,
  env: process.env,
});

const forwardSignal = (signal) => child.kill(signal);
process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('exit', (code, signal) => {
  process.exitCode = signal ? 1 : code ?? 1;
});
