import { spawn } from 'child_process';
import net from 'net';

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    // Explicitly check localhost and 0.0.0.0 to prevent overriding apps bound to specific interfaces
    server.listen(port, '0.0.0.0');
  });
}

async function isPortAvailableLocalhost(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

async function getAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (true) {
    const available0 = await isPortAvailable(port);
    const availableLocal = await isPortAvailableLocalhost(port);
    if (available0 && availableLocal) {
      return port;
    }
    port++;
  }
}

async function run() {
  const port = await getAvailablePort(3000);
  console.log(`\n🚀 [Auto-Port] Found available port: ${port}\n`);
  
  // Use spawn to keep colored output and stream it properly
  const child = spawn('npx', ['next', 'dev', '-p', port.toString(), '--webpack'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

run();
