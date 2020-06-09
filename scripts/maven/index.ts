import Times from '@cookiex/times'
import cliProgress from 'cli-progress'
import path from 'path'

import connection from '../../src/helpers/connection'
import Maven from '../../src/helpers/maven'
import Dir from '../../src/models/Dir'
import File from '../../src/models/File'

( async () => {

  const download = ( edition: any ) => new Promise<{
    url: string
    pagesCount: number
    output: string
    ed: string
  }>( async ( resolve, reject ) => {
    const progress = new cliProgress.SingleBar(
      { format: `[DOWNLOAD] ${edition.ed.replace( /,$/, '' )} | {bar} {percentage}% || pages: {value}/{total} || ETA: {eta}s` },
      cliProgress.Presets.shades_classic )

    progress.start( 20, 0 )
    try {
      const ed = edition.ed.replace( /,$/, '' )
      const output =  path.join( folder, `${ed}.pdf` )
      const url = `http://dashboard.nd.homolog.korbantech.com.br:9000/public/magazines/${ed}.pdf`
      let pagesCount: number
      if ( await File.exists( output ) ) {
        progress.increment( 20 )
        progress.stop()
        return resolve( { url, pagesCount, output, ed } )
      }
      const emitter = Maven.download( ed )

      emitter.on( 'count', count => progress.setTotal( pagesCount = count ) )
      emitter.on( 'download', () => progress.increment() )
      emitter.on( 'done', async pdf => File.write( output, pdf ) )
      emitter.on( 'error', err => {
        progress.stop()
        reject( err )
      } )

      emitter.on( 'done', () => {
        progress.stop()
        resolve( { url, pagesCount, output, ed } )
      } )
    } catch ( e ) { reject( e ) }
  } )

  const folder = path.resolve( __dirname, '..', '..', 'public', 'magazines' )

  if ( !await File.exists( folder ) ) await Dir.make( folder, { recursive: true } )

  const { data: editions } = await Maven.editions()

  console.log( `download ${editions.length} editions` )

  for ( let edition of editions ) {
    try {
      const info = await download( edition )
      try {
        const results = await connection( 'newspaper_editions' )
          .where( 'ed_maven_number', info.ed )
        
        if ( results.length ) console.log( 'file already in database' )
        else {
          await connection( 'newspaper_editions' )
            .insert( {
              ed_maven_number: info.ed,
              png_url: edition.info.CapaEdicao,
              pdf_url: info.url,
              pdf_file_path: info.output,
              screening_date: Times.Date.from( 'd/m/Y', edition.data )
            } )
          console.log( 'save edition in database' )
        }
      } catch ( e ) {
        console.log( 'error in save file in database' )
      }
    } catch ( e ) {
      console.log( 'error in download file' + e.message )
      break
    }
  }
} )()
