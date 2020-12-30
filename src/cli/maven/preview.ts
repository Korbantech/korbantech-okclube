import Maven from '@helpers/maven'
import { Command } from 'commander'

const preview = new Command( 'preview' )

preview.arguments( '<ed>' )

preview.aliases( [ 'view' ] )

preview.option( '-p, --page', 'show pages', false )
preview.option( '-i, --info', 'show info', false )

preview.action( ( ed: string ) => {
  const opts = preview.opts()
  Maven.fullEdition( ed )
    .then( ( { edition, client, magazine, pages } ) => {
      if ( opts.info ) {
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

        console.log( '------' )
      }

      console.group( 'Edition:' )
      console.log( `number: ${edition.numero}` )
      console.log( `title: ${edition.titulo}` )
      console.log( `ed: ${edition.ed}` )
      console.log( `created at: ${new Date( parseInt( edition.dataEpoch ) ).toLocaleString()}` )
      console.log( `updated at: ${new Date( parseInt( edition.dataUpdate ) ).toLocaleString()}` )
      console.groupEnd()

      if ( opts.page ) {

        console.log( '------' )

        console.group( `Pages: ${pages.length}` )

        pages.forEach( page => {
          console.log( `${page.id}\t${page.normal}\t${page.width}x${page.height}` )
        } )

        console.groupEnd()
      }
    } )
} )

export default preview
