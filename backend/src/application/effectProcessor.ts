import { GameRepository } from '../repositories/gameRepository';
import { Effect } from '../domain/effects';

export class EffectProcessor {
  constructor(private readonly repo: GameRepository) {}

  applyEffects(effects: Effect[]) {
    for (const e of effects) {
      switch (e.kind) {
        case 'damage': {
          this.repo.setLife(e.targetId, e.newLife);
          break;
        }
        case 'move':
        case 'push': {
          this.repo.setPosition(e.targetId, e.to);
          break;
        }
      }
    }
  }
} 