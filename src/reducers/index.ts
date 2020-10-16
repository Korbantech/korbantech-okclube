/* eslint-disable default-param-last */
// import deep from '@cookiex/deep'
import { State, Reducer } from '@store/index'

const initialState: State = {}

const mainReducer: Reducer = ( state = initialState, action ) => {
  switch ( action.type ) {
    case 'INSEGURE_MERGE_STATE': return { ...state, ...action.data }
    default: return state
  }
}

export = mainReducer
