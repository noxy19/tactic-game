import { GameRepository } from '../repositories/gameRepository';
import { AttackDefinition, AttackService } from '../domain/attack';
import { AbilityResult } from '../domain/effects';
import { EffectProcessor } from './effectProcessor';

export class PerformAttack {
  private readonly effectProcessor: EffectProcessor;

  constructor(
    private readonly repo: GameRepository,
    private readonly attackDefs: Record<string, AttackDefinition>
  ) {
    this.effectProcessor = new EffectProcessor(repo);
  }

  execute({ attackerId, targetId, attackType = 'basic' }: { attackerId: string; targetId: string; attackType?: string }): AbilityResult {
    const def = this.attackDefs[attackType];
    if (!def) {
      return { success: false, apLeft: 0, effects: [], error: `Unknown attack type: ${attackType}` };
    }

    const currentAp = this.repo.getAp(attackerId) ?? 0;
    const attackerPos = this.repo.getPosition(attackerId);
    const targetPos = this.repo.getPosition(targetId);
    const targetLife = this.repo.getLife(targetId);
    if (!attackerPos || !targetPos || targetLife === undefined) {
      return { success: false, apLeft: currentAp, effects: [], error: 'Invalid target' };
    }

    const result = AttackService.attemptAttack(currentAp, def, attackerPos, targetId, targetPos, targetLife);
    if (!result.success) {
      return result;
    }

    // apply effects to repository
    this.effectProcessor.applyEffects(result.effects);

    // persist AP
    this.repo.setAp(attackerId, result.apLeft);

    return result;
  }
} 