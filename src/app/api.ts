import Axios from 'axios'

import store from '../store'

const api = Axios.create( {
  baseURL: process.env.NODE_ENV !== 'production' ? 'http://localhost:9000/api' : 'https://api.app.ndmais.com.br/'
} )

api.interceptors.request.use( request => {
  const user = store.getState().user
  if ( user ) {
    const authorization = user.token
    Object.assign( request.headers, { authorization } )
  }
  return request
} )

export default api
