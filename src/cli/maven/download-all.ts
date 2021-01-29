import connection from '@helpers/connection'
import Maven from '@helpers/maven'
import downloadEdition from '@tools/downloadEdition'
import { Command } from 'commander'
import path from 'path'

const downloadAll = new Command( 'download-all' )

downloadAll.option( '--cdn <url>', 'set cdn url', process.env.DEFAULT_CDN_HOST )
downloadAll.option( '-f, --force', 'force download', false )
downloadAll.option( '-o, --output <url>', 'set output of pdf', path.resolve( 'public', 'magazines' ) )
downloadAll.option( '--notification', 'send notification to users', false )
downloadAll.option( '--notification-title <title>', 'notification title', 'Jornal' )
downloadAll.option( '--notification-message <message>', 'notification message', 'Edição {screening_date} lançada' )

const encapsulate = <T extends ( ...args: any ) => Promise<any>>( callback: T ): T => {
  return ( ( ...args: any[] ) => {
    try {
      return callback( ...args )
    } catch ( e ) { return Promise.reject( e ) }
  } ) as T
}

downloadAll.action( encapsulate( async () => {
  const { data: editions } = await Maven.editions()
  const options = Object.assign( downloadAll.opts(), { jumpErrors: true } )
  await editions?.reduce( async ( promise, edition ) => {
    return promise.then( () => {
      console.log( `Download ${edition.ed}` )
      return downloadEdition( edition.ed, options )
    } )
  }, Promise.resolve() )

  connection.destroy()
  console.log( 'Done' )
  process.exit()
} ) )

export default downloadAll
