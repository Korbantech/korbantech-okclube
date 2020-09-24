import 'react-redux'
import store from '@store/index'

declare module 'react-redux' {
  export interface DefaultRootState extends store.State {}
}
