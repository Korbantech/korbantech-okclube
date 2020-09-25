import Axios from 'axios'

const api = Axios.create( {
  baseURL: process.env.NODE_ENV !== 'production' ? 'http://localhost:9000/api' : 'http://api.app.ndmais.com.br/'
} )

api.interceptors.request.use( request => {
  return request
} )

export default api
