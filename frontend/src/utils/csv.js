/**
 * @param {unknown} v
 * @returns {string}
 */
export function escapeCsvCell(v) {
  const s = String(v ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
