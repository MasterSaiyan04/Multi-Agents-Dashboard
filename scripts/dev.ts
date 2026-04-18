import { spawn } from 'node:child_process';

function run(command: string, args: string[]) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
}

const server = run('npm', ['run', 'dev:server']);
const client = run('npm', ['run', 'dev:client']);

function shutdown(signal: NodeJS.Signals) {
  server.kill(signal);
  client.kill(signal);
  process.exit();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
