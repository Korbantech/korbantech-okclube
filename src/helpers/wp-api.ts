import Axios from 'axios'

const wpApi = Axios.create()

wpApi.defaults.baseURL = 'https://ndmais.com.br/wp-json'

export default wpApi
