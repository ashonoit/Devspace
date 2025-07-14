import { spawn, IPty } from 'node-pty';
import { EventEmitter } from 'events';

const SHELL = "bash";

export class TerminalManager {
  private sessions: Record<string, { terminal: IPty; spaceId: string }> = {};

  createPty(
    socketId: string,
    spaceId: string,
    onData: (data: string, pid: number) => void
  ): IPty {
    const term = spawn(SHELL, [], {
      cols: 100,
      name: 'xterm',
      cwd: `/workspace`,
    }) as IPty & EventEmitter;

    // forward incoming data back to your callback
    term.on('data', (data: string) => onData(data, term.pid));

    // store by socket ID
    this.sessions[socketId] = { terminal: term, spaceId };

    // when the pty exits, clean up using the same key
    term.on('exit', () => {
      delete this.sessions[socketId];
    });

    return term;
  }

  write(socketId: string, data: string) {
    this.sessions[socketId]?.terminal.write(data);
  }

  clear(socketId: string) {
    const session = this.sessions[socketId];
    if (session) {
      session.terminal.kill();
      delete this.sessions[socketId];
    }
  }
}
