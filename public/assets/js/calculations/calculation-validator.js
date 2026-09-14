/**
 * assets/js/calculations/calculation-validator.js
 * Validates financial computation inputs and results:
 * Prevents divide-by-zero, NaN, Infinity, -Infinity.
 */

export function isValidNumber(val) {
  return val !== null && val !== undefined && val !== '' && !isNaN(val) && isFinite(val);
}

export function sanitizeResult(val) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return null;
  }
  return Number(val);
}

export function safeDivide(numerator, denominator) {
  if (!isValidNumber(numerator) || !isValidNumber(denominator)) return null;
  const num = Number(numerator);
  const den = Number(denominator);
  if (den === 0) return null;
  const res = num / den;
  return isFinite(res) ? res : null;
}

export function safeGrowth(current, previous) {
  if (!isValidNumber(current) || !isValidNumber(previous)) return null;
  const curr = Number(current);
  const prev = Number(previous);
  if (prev === 0) return null;
  const res = (curr - prev) / Math.abs(prev);
  return isFinite(res) ? res : null;
}
