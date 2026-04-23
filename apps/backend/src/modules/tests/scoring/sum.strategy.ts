import { IScoringStrategy, ScoringResult } from './scoring.strategy';

interface Threshold {
  category: string;
  min: number;
  max: number;
}

export class SumScoringStrategy implements IScoringStrategy {
  calculate(answers: number[], _algorithm: unknown, thresholds: unknown): ScoringResult {
    const totalScore = answers.reduce((sum, a) => sum + (a ?? 0), 0);

    const levels = thresholds as Threshold[];
    const match = levels.find((t) => totalScore >= t.min && totalScore <= t.max);
    const scoreCategory = match?.category ?? 'BELIRSIZ';

    return { totalScore, scoreCategory };
  }
}
