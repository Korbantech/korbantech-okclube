import Axios from 'axios'

const wpApi = Axios.create( {
  baseURL: 'https://ndmais.com.br/wp-json',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} )

export default wpApi
