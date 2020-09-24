import Axios from 'axios'

const api = Axios.create( {
  baseURL: false ? 'http://localhost:9000/api' : 'http://api.app.ndmais.com.br/'
} )

api.interceptors.request.use( request => {
  return request
} )

export default api
