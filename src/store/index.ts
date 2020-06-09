import {
  useDispatch as reactReduxUseDispatch,
  useSelector as reactReduxUseSelector,
  useStore as reactReduxUseStore
} from 'react-redux'

import Redux, { createStore } from 'redux'

import ifBrowser from '../helpers/ifBrowser'

export const useDispatch: Store.UseDispatch = reactReduxUseDispatch
export const useSelector: Store.UseSelector = reactReduxUseSelector
export const useStore: Store.UseStore = reactReduxUseStore

declare module 'redux' {
  export function combineReducers( subs: {
    [S in keyof Store.State]?: Store.SubReducer<S>
  } ): Store.Reducer
}

const Store = ifBrowser(
  () => {
    // @ts-ignore
    const state = window.__PRELOADED_STATE__
    // @ts-ignore
    delete window.__PRELOADED_STATE__
  
    const store = createStore<Store.State, Store.Action, unknown, unknown>( state => state || {}, state )

    return Object.assign( store, { initialState: state } )
  },
  () => {

    const store = createStore<Store.State, Store.Action, unknown, unknown>( state => state || {}, {} )

    return Object.assign( store, { initialState: {} } )
  }
)

export interface StoreState {}
export interface StoreActions {}

namespace Store {

  export interface UseSelector {
    <S>( selector: ( state: State ) => S, checker: ( old: S, newer: S ) => boolean ): S
  }
  export interface UseDispatch {
    (): Dispatch
  }
  export interface UseStore {
    (): Interface
  }

  export interface Interface extends Redux.Store<State, Action> {}
  export interface State extends StoreState {}
  export interface Actions extends StoreActions {}

  export interface Action<A extends keyof Actions = keyof Actions>
    extends Redux.Action<A> {
      data: Actions[A]
    }

  export interface Dispatch<A extends keyof Actions = keyof Actions>
    extends Redux.Dispatch<Actions[A]> {}

  export interface Reducer<A extends keyof Actions = keyof Actions>
    extends Redux.Reducer<State, Action<A>> {}

  export interface SubReducer<S extends keyof State, A extends keyof Actions = keyof Actions>
    extends Redux.Reducer<State[S], Action<A>> {}

  export interface ActionCreator extends Redux.ActionCreator<Actions> {}
}

export default Store
