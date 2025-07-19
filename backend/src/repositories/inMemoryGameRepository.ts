import { Board, Position } from "../domain/board";
import { GameRepository } from "./gameRepository";

export type PlayerID = string;

export class InMemoryGameRepository implements GameRepository {
  private playerIds: PlayerID[] = [];
  private positions: Record<PlayerID, { x: number; y: number }> = {};
  private lifePoints: Record<PlayerID, number> = {};
  private names: Record<PlayerID, string> = {};
  private actionPoints: Record<PlayerID, number> = {};

  constructor(private readonly board: Board) {
    this.board = board;
  }

  getBoard() {
    return this.board;
  }

  getPlayers() {
    return [...this.playerIds];
  }

  addPlayer(playerID: PlayerID) {
    this.playerIds.push(playerID);
  }

  removePlayer(playerID: PlayerID) {
    this.playerIds = this.playerIds.filter((p) => p !== playerID);
    delete this.positions[playerID];
    delete this.lifePoints[playerID];
    delete this.actionPoints[playerID];
  }

  getPosition(playerID: PlayerID) {
    return this.positions[playerID];
  }

  setPosition(playerID: PlayerID, pos: Position) {
    this.positions[playerID] = pos;
  }

  getAllPositions() {
    return { ...this.positions };
  }

  getLife(playerID: PlayerID) {
    return this.lifePoints[playerID];
  }

  setLife(playerID: PlayerID, life: number) {
    this.lifePoints[playerID] = life;
  }

  getName(playerID: PlayerID) {
    return this.names[playerID];
  }

  setName(playerID: PlayerID, name: string) {
    this.names[playerID] = name;
  }

  getAllLife() {
    return { ...this.lifePoints };
  }

  getAllNames() {
    return { ...this.names };
  }

  getAp(playerID: PlayerID) {
    return this.actionPoints[playerID];
  }

  setAp(playerID: PlayerID, ap: number) {
    this.actionPoints[playerID] = ap;
  }
}
