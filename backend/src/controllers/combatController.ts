import WebSocket, { RawData } from 'ws';
import { CombatService } from '../application/combatService';

export function registerCombatSocketHandlers(socket: WebSocket, combatService: CombatService) {
  // Wrap socket.send to log outgoing messages
  const rawSend = socket.send.bind(socket);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (socket as any).send = (data: any, ...args: any[]) => {
    try {
      const text = typeof data === 'string' ? data : data.toString();
      console.log('[WS OUT]', text);
    } catch {
      /* ignore */
    }
    return rawSend(data, ...args);
  };

  socket.on('message', (data: RawData) => {
    console.log('[WS IN]', data.toString());
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'join') {
        combatService.addPlayer(socket, message.payload);
      } else if (message.type === 'action') {
        combatService.handleAction(socket, message.payload);
      }
    } catch (err) {
      console.error('Invalid message', err);
    }
  });

  socket.on('close', () => {
    combatService.removePlayer(socket);
  });
} 