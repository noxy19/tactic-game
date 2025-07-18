import { GameRepository } from '../repositories/gameRepository';

export interface MoveResult {
  success: boolean;
  movesLeft: number;
  error?: string;
}

export class MovementService {
  private movesLeft = 0;
  constructor(private readonly repo: GameRepository) {}

  startTurn(maxMoves: number) {
    this.movesLeft = maxMoves;
  }

  attemptMove(id: string, to: { x: number; y: number }): MoveResult {
    if (this.movesLeft <= 0) {
      return { success: false, movesLeft: 0, error: 'No moves left' };
    }

    const from = this.repo.getPosition(id);
    if (!from) return { success: false, movesLeft: this.movesLeft, error: 'Position unknown' };

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const totalMoves = dx + dy;
    if (totalMoves > this.movesLeft) {
      return { success: false, movesLeft: this.movesLeft, error: 'Invalid move' };
    }

    const occupied = Object.values(this.repo.getAllPositions()).some(
      (p) => p.x === to.x && p.y === to.y
    );
    if (occupied) {
      return { success: false, movesLeft: this.movesLeft, error: 'Cell occupied' };
    }

    // apply move
    this.repo.setPosition(id, to);
    this.movesLeft -= totalMoves;
    return { success: true, movesLeft: this.movesLeft };
  }

  getMovesLeft() {
    return this.movesLeft;
  }
} 