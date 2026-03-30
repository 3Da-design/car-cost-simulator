/**
 * @typedef {Object} Car
 * @property {string|number} id
 * @property {string} [maker]
 * @property {string} [model]
 * @property {string} [name]
 * @property {number|string} [fuel]
 * @property {number|string} [engine]
 * @property {number|string} [price]
 * @property {number} [inspection]
 */

/**
 * @typedef {Object} CalcResult
 * @property {number} total
 * @property {number} monthly
 * @property {number} vehicle_annual
 * @property {number} total_with_vehicle
 * @property {number} monthly_with_vehicle
 * @property {number} gas_cost
 * @property {number} tax
 * @property {number} inspection_annual
 * @property {number} insurance
 * @property {number} parking_annual
 */

/**
 * 結果画面「計算の前提」に渡す入力のスナップショット
 * @typedef {Object} ResultAssumptions
 * @property {string} [carName]
 * @property {string|number} [distance]
 * @property {string|number} [fuel]
 * @property {string|number} [gasPrice]
 * @property {string|number} [engine]
 * @property {string|number} [price]
 * @property {string|number} [insurance]
 * @property {string|number} [parking]
 * @property {string|number} [inspection]
 * @property {string|number} [ownershipYears]
 */

export {}
