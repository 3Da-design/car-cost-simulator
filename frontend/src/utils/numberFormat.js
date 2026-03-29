/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatEngineToThreeDecimals(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return ''
  return numeric.toFixed(3)
}
