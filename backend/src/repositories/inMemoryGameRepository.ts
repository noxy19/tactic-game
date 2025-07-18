import { GameRepository } from './gameRepository';

export class InMemoryGameRepository implements GameRepository {
  private playerIds: string[] = [];
  private positions: Record<string, { x: number; y: number }> = {};
  private lifePoints: Record<string, number> = {};
  private actionPoints: Record<string, number> = {};

  getPlayers() {
    return [...this.playerIds];
  }

  addPlayer(id: string) {
    this.playerIds.push(id);
  }

  removePlayer(id: string) {
    this.playerIds = this.playerIds.filter((p) => p !== id);
    delete this.positions[id];
    delete this.lifePoints[id];
    delete this.actionPoints[id];
  }

  getPosition(id: string) {
    return this.positions[id];
  }

  setPosition(id: string, pos: { x: number; y: number }) {
    this.positions[id] = pos;
  }

  getAllPositions() {
    return { ...this.positions };
  }

  getLife(id: string) {
    return this.lifePoints[id];
  }

  setLife(id: string, life: number) {
    this.lifePoints[id] = life;
  }

  getAllLife() {
    return { ...this.lifePoints };
  }

  getAp(id: string) {
    return this.actionPoints[id];
  }

  setAp(id: string, ap: number) {
    this.actionPoints[id] = ap;
  }
} 