import downloadEdition from '@tools/downloadEdition'
import { Command } from 'commander'
import path from 'path'

const download = new Command( 'download' )

download.arguments( '<ed>' )

download.option( '--cdn <url>', 'set cdn url', 'http://d38iurctu47dce.cloudfront.net/' )
download.option( '-f, --force', 'force download', false )
download.option( '-o, --output <url>', 'set output of pdf', path.resolve( 'public', 'magazines' ) )
download.option( '--no-notification', 'send notification to users', false )
download.option( '--notification-title <title>', 'notification title', 'Jornal' )
download.option( '--notification-message <message>', 'notification message', 'Edição {screening_date} lançada' )

download.action( async ( ed: string ) => downloadEdition( ed, download.opts() ) )

export default download
