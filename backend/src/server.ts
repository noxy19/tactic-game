import { registerCombatSocketHandlers } from './controllers/combatController';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { InMemoryGameRepository } from './repositories/inMemoryGameRepository';
import { CombatService } from './application/combatService';
import { MovementService } from './application/movementService';
import { PerformAttack } from './application/performAttack';
import { attackDefinitions } from './domain/attack';

const app = express();
const server = http.createServer(app);

const repository = new InMemoryGameRepository();
const movementService = new MovementService(repository);


const performAttack = new PerformAttack(repository, attackDefinitions);

const combatService = new CombatService(repository, movementService, performAttack);

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  console.log('Client connected');
  registerCombatSocketHandlers(socket, combatService);
});

const PORT = process.env.PORT ?? 3001;
server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 