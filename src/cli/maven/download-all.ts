import Maven from '@helpers/maven'
import downloadEdition from '@tools/downloadEdition'
import { Command } from 'commander'
import path from 'path'

const downloadAll = new Command( 'download-all' )

downloadAll.option( '--cdn <url>', 'set cdn url', 'http://d38iurctu47dce.cloudfront.net/' )
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

  const promise = editions?.reduce( async ( promise, edition ) => {
    console.log( `Download ${edition.ed}` )
    return promise.then( () => downloadEdition( edition.ed, downloadAll.opts() ) )
  }, Promise.resolve() )

  await promise

  console.log( 'Done' )
} ) )

export default downloadAll
