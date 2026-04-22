const K_FACTOR = 32;

export interface EloUpdate {
  itemRating: number;
  studentRating: number;
  correct: boolean;
  k?: number;
}

export function updateElo({ itemRating, studentRating, correct, k = K_FACTOR }: EloUpdate) {
  const expected = 1 / (1 + Math.pow(10, (itemRating - studentRating) / 400));
  const actual = correct ? 1 : 0;
  return {
    newStudentRating: studentRating + k * (actual - expected),
    newItemRating: itemRating + k * (expected - actual),
  };
}

export interface DifficultyBand {
  min: number;
  max: number;
  stretchMax: number;
}

export function chooseDifficultyBand(studentElo: number): DifficultyBand {
  return {
    min: studentElo - 150,
    max: studentElo + 150,
    stretchMax: studentElo + 200,
  };
}
