import { WebSocket } from "ws";
import { GameRepository } from "../repositories/gameRepository";
import { MovementService } from "./movementService";
import { PerformAttack } from "./performAttack";
import { attackDefinitions } from "../domain/attack";

interface PlayerSession {
  id: string;
  name: string;
  socket: WebSocket;
}

export class CombatService {
  private currentTurnIndex = 0;
  private sessions: PlayerSession[] = [];

  constructor(
    private readonly repo: GameRepository,
    private readonly moveService: MovementService,
    private readonly performAttack: PerformAttack
  ) {}

  addPlayer(socket: WebSocket, { id, name }: { id: string; name: string }) {
    this.repo.addPlayer(id);
    // assign starting position sequentially on first column
    const startPos = { x: this.sessions.length, y: 0 };
    this.repo.setPosition(id, startPos);
    this.repo.setLife(id, 100);
    this.repo.setName(id, name);
    this.sessions.push({ id, name, socket });
    // send current positions snapshot to the new player
    socket.send(
      JSON.stringify({
        type: "state",
        payload: {
          positions: this.repo.getAllPositions(),
          life: this.repo.getAllLife(),
          names: this.repo.getAllNames(),
        },
      })
    );
    // notify all players of the new spawn
    this.broadcast({
      type: "spawn",
      payload: { id, name: name, position: startPos, life: 100 },
    });
    this.broadcast({
      type: "system",
      payload: `${name} joined the battle`,
    });
    if (this.sessions.length === 2) {
      this.startGame();
    }
  }

  removePlayer(socket: WebSocket) {
    const player = this.sessions.find((s) => s.socket === socket);
    if (player) {
      this.repo.removePlayer(player.id);
      this.sessions = this.sessions.filter((s) => s.socket !== socket);
      this.broadcast({
        type: "system",
        payload: `${player.name} left the battle. Game over.`,
      });
    }
  }

  private startGame() {
    this.currentTurnIndex = 0;
    this.moveService.startTurn(3);
    // grant AP to the current player for the first turn
    const currentPlayer = this.sessions[this.currentTurnIndex];
    if (currentPlayer) {
      this.repo.setAp(currentPlayer.id, 6);
    }
    this.notifyTurn();
  }

  private notifyTurn() {
    const current = this.sessions[this.currentTurnIndex];
    const apLeft = this.repo.getAp(current.id) ?? 0;
    current.socket.send(
      JSON.stringify({
        type: "your-turn",
        payload: { moves: this.moveService.getMovesLeft(), ap: apLeft },
      })
    );
    this.broadcastExcept(current.socket, { type: "wait-turn" });
  }

  handleAction(socket: WebSocket, action: any) {
    const current = this.sessions[this.currentTurnIndex];
    if (socket !== current.socket) {
      socket.send(JSON.stringify({ type: "error", payload: "Not your turn" }));
      return;
    }
    if (action.kind === "move") {
      const { id, to } = action;
      const result = this.moveService.attemptMove(id, to);
      if (!result.success) {
        socket.send(JSON.stringify({ type: "error", payload: result.error }));
        return;
      }
      this.broadcast({
        type: "action",
        payload: { ...action, movesLeft: result.movesLeft },
      });
      // no automatic turn passing
      return;
    } else if (action.kind === "pass") {
      // end current player's turn -> advance index
      this.currentTurnIndex =
        (this.currentTurnIndex + 1) % this.sessions.length;

      this.moveService.startTurn(3);

      // reset AP for new active player
      const newCurrent = this.sessions[this.currentTurnIndex];
      this.repo.setAp(newCurrent.id, 6);

      this.broadcast({
        type: "action",
        payload: { kind: "pass", id: action.id },
      });
      this.notifyTurn();
    } else if (action.kind === "attack") {
      const { id, target, attackType = "basic" } = action;
      const attackerPos = this.repo.getPosition(id);
      const targetPos = this.repo.getPosition(target);
      if (!attackerPos || !targetPos) return;
      const dx = Math.abs(attackerPos.x - targetPos.x);
      const dy = Math.abs(attackerPos.y - targetPos.y);
      const distance = dx + dy;

      const def = attackDefinitions[attackType] ?? attackDefinitions["basic"];
      if (distance > def.range || distance === 0) {
        socket.send(
          JSON.stringify({ type: "error", payload: "Target out of range" })
        );
        return;
      }
      const res = this.performAttack.execute({
        attackerId: id,
        targetId: target,
        attackType,
      });
      if (!res.success) {
        socket.send(JSON.stringify({ type: "error", payload: res.error }));
        return;
      }
      this.broadcast({
        type: "action",
        payload: {
          kind: "attack",
          id,
          attackType,
          effects: res.effects,
          apLeft: res.apLeft,
        },
      });
    }
  }

  private broadcast(message: any) {
    this.sessions.forEach((s) => s.socket.send(JSON.stringify(message)));
  }

  private broadcastExcept(except: WebSocket, message: any) {
    this.sessions.forEach((s) => {
      if (s.socket !== except) {
        s.socket.send(JSON.stringify(message));
      }
    });
  }
}
