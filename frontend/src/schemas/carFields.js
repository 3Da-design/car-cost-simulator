/**
 * 入力・API と整合するフィールドのメタ情報（マジックナンバー回避用）
 * 数値は UI の max / step の参考。バックエンド制約と異なる場合は API 側を正とする。
 */
export const carFieldMeta = {
  distance: { min: 0, max: 500000, step: 1000 },
  gasPrice: { min: 0, max: 500, step: 1 },
  insurance: { min: 0, max: 2000000, step: 1000 },
  parking: { min: 0, max: 200000, step: 500 },
  inspection: { min: 0, max: 2000000, step: 1000 },
  ownershipYears: { min: 1, max: 50, step: 1 },
}
