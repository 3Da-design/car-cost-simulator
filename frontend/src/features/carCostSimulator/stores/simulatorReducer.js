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
      const car = /** @type {{ segment?: string, fuel?: unknown, engine?: unknown, price?: unknown, inspection?: number, powertrain?: string, electric_wh_per_km?: unknown, hydrogen_km_per_kg?: unknown }} */ (
        action.payload
      )
      const base = {
        fuel: String(car.fuel ?? ''),
        engine: formatEngineToThreeDecimals(car.engine),
        price: String(car.price ?? ''),
        inspection: car.inspection ?? 100000,
      }
      if (car.segment === 'plugin_ev') {
        const pt = car.powertrain === 'phev' || car.powertrain === 'fcv' ? car.powertrain : 'bev'
        return {
          ...state,
          ...base,
          powertrain: pt,
          electricWhPerKm:
            car.electric_wh_per_km != null && car.electric_wh_per_km !== ''
              ? String(car.electric_wh_per_km)
              : '',
          hydrogenKmPerKg:
            car.hydrogen_km_per_kg != null && car.hydrogen_km_per_kg !== ''
              ? String(car.hydrogen_km_per_kg)
              : '',
        }
      }
      return {
        ...state,
        ...base,
      }
    }
    default:
      return state
  }
}
