import Maven from '@helpers/maven'
import { Command } from 'commander'

const info = new Command( 'info' )

info.action( () => {
  Maven.info()
    .then( ( { client, magazine } ) => {
      console.group( 'Client:' )
      console.log( `name: ${client.nome}` )
      console.log( `ep: ${client.ep}` )
      console.log( `created at:   ${new Date( client.datetheme ).toLocaleString()}` )
      console.groupEnd()

      console.log( '------' )

      console.group( 'Magazine:' )
      console.log( `title: ${magazine.titulo}` )
      console.log( `prefix: ${magazine.prefixo}` )
      console.log( `about: ${magazine.sobre}` )
      console.log( `cd: ${magazine.cd}` )
      console.groupEnd()
    } )
} )

export default info
