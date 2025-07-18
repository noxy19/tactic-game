export interface GameRepository {
  getPlayers(): string[];
  addPlayer(id: string): void;
  removePlayer(id: string): void;
  getPosition(id: string): { x: number; y: number } | undefined;
  setPosition(id: string, pos: { x: number; y: number }): void;
  getAllPositions(): Record<string, { x: number; y: number }>;
  getLife(id: string): number | undefined;
  setLife(id: string, life: number): void;
  getAllLife(): Record<string, number>;

  /* Action Points */
  getAp(id: string): number | undefined;
  setAp(id: string, ap: number): void;
} 