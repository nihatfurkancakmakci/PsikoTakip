import { Injectable } from '@nestjs/common';
import { IScoringStrategy } from './scoring.strategy';
import { SumScoringStrategy } from './sum.strategy';

@Injectable()
export class ScoringFactory {
  getStrategy(_algorithmType: string): IScoringStrategy {
    // Default: sum scoring (Beck ve SCL-90 için geçerli)
    // İleride: WeightedSum, SubscaleSum vb. eklenebilir
    return new SumScoringStrategy();
  }
}
