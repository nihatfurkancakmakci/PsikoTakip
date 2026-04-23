export interface ScoringResult {
  totalScore: number;
  scoreCategory: string;
  details?: Record<string, unknown>;
}

export interface IScoringStrategy {
  calculate(answers: number[], scoringAlgorithm: unknown, thresholds: unknown): ScoringResult;
}
