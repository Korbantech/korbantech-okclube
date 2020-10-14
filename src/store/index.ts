// @ts-ignore
import mainReducer from '@reducers/index'
import Redux, { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'

const userSessionSave = localStorage.getItem( 'user-session' )

const user = userSessionSave ? JSON.parse( userSessionSave ) : null

const initialState: store.State = { user }

const store: Redux.Store<store.State, store.Action> = createStore<store.State, store.Action, unknown, unknown>(
  mainReducer,
  initialState,
  applyMiddleware( logger )
)

namespace store {
  export namespace State {
    export interface User {
      id: number
      token: string
      email: string
      name: string
    }
  }
  export interface State {
    user?: State.User | null
  }
  export interface Action extends Redux.Action<'INSEGURE_MERGE_STATE'> { data: any }
  export interface Dispatch extends Redux.Dispatch<Action> {}
  export interface Reducer extends Redux.Reducer<State, Action> {}
}

export = store
