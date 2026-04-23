import { SumScoringStrategy } from './sum.strategy';

describe('SumScoringStrategy', () => {
  const strategy = new SumScoringStrategy();
  const bdeThresholds = [
    { min: 0, max: 13, category: 'NORMAL' },
    { min: 14, max: 19, category: 'HAFIF' },
    { min: 20, max: 28, category: 'ORTA' },
    { min: 29, max: 63, category: 'AGIR' },
  ];

  it('sıfır skoru NORMAL döner', () => {
    const result = strategy.calculate(Array(21).fill(0), {}, bdeThresholds);
    expect(result.totalScore).toBe(0);
    expect(result.scoreCategory).toBe('NORMAL');
  });

  it('21 skoru HAFIF döner', () => {
    const answers = Array(21).fill(1); // 21 * 1 = 21
    const result = strategy.calculate(answers, {}, bdeThresholds);
    expect(result.totalScore).toBe(21);
    expect(result.scoreCategory).toBe('ORTA');
  });

  it('BDE-II maksimum skor 63 AGIR döner', () => {
    const result = strategy.calculate(Array(21).fill(3), {}, bdeThresholds);
    expect(result.totalScore).toBe(63);
    expect(result.scoreCategory).toBe('AGIR');
  });

  it('skor 2 saniye altında hesaplanır', () => {
    const start = Date.now();
    strategy.calculate(Array(90).fill(4), {}, bdeThresholds);
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
