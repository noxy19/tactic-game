import { Board, Position } from "../domain/board";
import { PlayerID } from "./inMemoryGameRepository";

export interface GameRepository {
  getBoard(): Board;
  getPlayers(): PlayerID[];
  addPlayer(playerID: PlayerID): void;
  removePlayer(playerID: PlayerID): void;
  getPosition(playerID: PlayerID): Position | undefined;
  setPosition(playerID: PlayerID, pos: Position): void;
  getAllPositions(): Record<PlayerID, Position>;
  getLife(playerID: PlayerID): number | undefined;
  setLife(playerID: PlayerID, life: number): void;
  getAllLife(): Record<PlayerID, number>;

  /* Action Points */
  getAp(playerID: PlayerID): number | undefined;
  setAp(playerID: PlayerID, ap: number): void;
}
