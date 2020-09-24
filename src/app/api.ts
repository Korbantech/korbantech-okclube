import Axios from 'axios'

const api = Axios.create( { baseURL: 'http://localhost:9000/api' } )

api.interceptors.request.use( request => {
  return request
} )

export default api
