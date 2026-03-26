import { spawn } from 'child_process';
import { readFile, unlink } from 'fs/promises';
import net from 'net';
import path from 'path';

type NextDevLock = {
  pid: number;
  port?: number;
  hostname?: string;
  appUrl?: string;
  startedAt?: number;
};

const projectRoot = process.cwd();
const lockFilePath = path.join(projectRoot, '.next', 'dev', 'lock');
const nextBin = path.join(
  projectRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next',
);

function isAddressInUse(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EADDRINUSE';
}

function isProcessRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (error) => {
      resolve(!isAddressInUse(error));
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function getAvailablePort(startPort: number): Promise<number> {
  let port = startPort;

  while (true) {
    const availableOnAllInterfaces = await isPortAvailable(port, '0.0.0.0');
    const availableOnLocalhost = await isPortAvailable(port, '127.0.0.1');

    if (availableOnAllInterfaces && availableOnLocalhost) {
      return port;
    }

    port += 1;
  }
}

async function readExistingLock(): Promise<NextDevLock | null> {
  try {
    const lockContent = await readFile(lockFilePath, 'utf8');
    return JSON.parse(lockContent) as NextDevLock;
  } catch {
    return null;
  }
}

async function removeLockFile() {
  try {
    await unlink(lockFilePath);
  } catch {
    return;
  }
}

async function stopExistingDevServer() {
  const lock = await readExistingLock();

  if (!lock?.pid) {
    await removeLockFile();
    return;
  }

  if (!isProcessRunning(lock.pid)) {
    await removeLockFile();
    return;
  }

  process.kill(lock.pid, 'SIGTERM');

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (!isProcessRunning(lock.pid)) {
      await removeLockFile();
      return;
    }

    await wait(100);
  }

  process.kill(lock.pid, 'SIGKILL');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (!isProcessRunning(lock.pid)) {
      await removeLockFile();
      return;
    }

    await wait(100);
  }

  await removeLockFile();
}

async function run() {
  await stopExistingDevServer();

  const port = await getAvailablePort(3000);
  console.log(`\n🚀 [Auto-Port] Found available port: ${port}\n`);

  const child = spawn(nextBin, ['dev', '-p', port.toString(), '--hostname', '127.0.0.1', '--webpack'], {
    stdio: 'inherit',
    shell: false,
  });

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));
  process.on('SIGQUIT', () => forwardSignal('SIGQUIT'));

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

run();
