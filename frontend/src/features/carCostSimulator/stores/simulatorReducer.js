import { formatEngineToThreeDecimals } from '../../../utils/numberFormat.js'

/**
 * @param {typeof import('./initialState.js').initialSimulatorState} state
 * @param {{ type: string, payload?: unknown }} action
 */
export function simulatorReducer(state, action) {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, ...action.payload }
    case 'HYDRATE_FROM_CAR': {
      const car = /** @type {{ fuel?: unknown, engine?: unknown, price?: unknown, inspection?: number }} */ (
        action.payload
      )
      return {
        ...state,
        fuel: String(car.fuel),
        engine: formatEngineToThreeDecimals(car.engine),
        price: String(car.price),
        inspection: car.inspection ?? 100000,
      }
    }
    default:
      return state
  }
}
