export type Effect =
  | {
      kind: 'damage';
      targetId: string;
      amount: number;
      newLife: number;
    }
  | {
      kind: 'move' | 'push';
      targetId: string;
      to: { x: number; y: number };
    };

export interface AbilityResult {
  success: boolean;
  apLeft: number;
  effects: Effect[];
  error?: string;
} 