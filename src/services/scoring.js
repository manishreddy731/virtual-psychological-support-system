export function scoreLikert(answers, min=0, max=3) {
  if (!Array.isArray(answers)) throw new Error('answers must be array');
  const invalid = answers.some(a => typeof a !== 'number' || a < min || a > max);
  if (invalid) throw new Error('invalid answer value');
  const total = answers.reduce((s, x) => s + x, 0);
  return { total };
}

export function interpretPHQ9(total){
  if (total <= 4) return 'minimal';
  if (total <= 9) return 'mild';
  if (total <= 14) return 'moderate';
  if (total <= 19) return 'moderately severe';
  return 'severe';
}

export function interpretGAD7(total){
  if (total <= 4) return 'minimal';
  if (total <= 9) return 'mild';
  if (total <= 14) return 'moderate';
  return 'severe';
}
