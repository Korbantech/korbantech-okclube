import { User } from './bridges/User'
import { connection } from './services/typeorm'

( async () => {
  const conn = await connection
  const user = await User( {
    name: 'MARCO ANTONIO GOLINI BRASIL',
    email: 'atendimento@ndmais.com.br',
    document: '88873030700',
    password: '123456'
  } ).save()

  console.log( user )
  
  await conn.close()
} )()
