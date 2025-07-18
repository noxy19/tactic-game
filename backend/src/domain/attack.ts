export interface AttackDefinition {
  cost: number;
  minDamage: number;
  maxDamage: number;
  range: number; // Manhattan distance (dx + dy) allowed
  pushDistance?: number; // cells to push target away from attacker
}

export const attackDefinitions: Record<string, AttackDefinition> = {
  basic: { cost: 2, minDamage: 5, maxDamage: 10, range: 3 },
  heavy: { cost: 4, minDamage: 10, maxDamage: 40, range: 1, pushDistance: 2 }
};

import { AbilityResult, Effect } from './effects';

export class AttackService {
  static attemptAttack(
    currentAp: number,
    def: AttackDefinition,
    attackerPos: { x: number; y: number },
    targetId: string,
    targetPos: { x: number; y: number },
    targetLife: number,
    boardSize = 8
  ): AbilityResult {
    if (currentAp < def.cost) {
      return { success: false, apLeft: currentAp, effects: [], error: 'Not enough AP' };
    }

    const damage = Math.floor(Math.random() * (def.maxDamage - def.minDamage + 1)) + def.minDamage;
    const apLeft = currentAp - def.cost;

    const newLife = Math.max(0, targetLife - damage);

    const effects: Effect[] = [
      { kind: 'damage', targetId, amount: damage, newLife }
    ];

    // Push effect
    if (def.pushDistance && def.pushDistance > 0) {
      const dx = Math.sign(targetPos.x - attackerPos.x);
      const dy = Math.sign(targetPos.y - attackerPos.y);
      let newX = targetPos.x + dx * def.pushDistance;
      let newY = targetPos.y + dy * def.pushDistance;

      // clamp within board
      newX = Math.max(0, Math.min(boardSize - 1, newX));
      newY = Math.max(0, Math.min(boardSize - 1, newY));

      effects.push({ kind: 'push', targetId, to: { x: newX, y: newY } });
    }

    return { success: true, apLeft, effects };
  }
} 