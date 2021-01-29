import Times from '@cookiex/times'
import connection from '@helpers/connection'
import Maven from '@helpers/maven'
import Dir from '@models/Dir'
import PDF from '@tools/merge-pdfs'
import sendNotification from '@tools/sendNotification'
import Axios from 'axios'
import fs from 'fs'
import { mkdir, stat, rmdir } from 'fs/promises'
import mv from 'mv'
import path from 'path'
import PDFDocument from 'pdfkit'

const exists = ( path: fs.PathLike ) =>
  stat( path ).then( () => true, () => false )

const encapsulate = <T extends ( ...args: any ) => Promise<any>>( callback: T ): T => {
  return ( ( ...args: any[] ) => {
    try {
      return callback( ...args )
    } catch ( e ) { return Promise.reject( e ) }
  } ) as T
}

const downloadEdition = encapsulate( async ( ed: string, opts: any, close = false ) => {
  const tempDir = await Dir.temp( 'pdf-tmp-' )
  const { edition, pages } = await Maven.fullEdition( ed )
  const fullTempPath = path.join( tempDir, edition.ed )
  const name = `${ed}-${Date.now().toString( 36 )}.pdf`
  const outputFullpath = path.join( opts.output, name )
  const editionInDb = await connection( 'newspaper_editions' ).where( 'ed_maven_number', ed ).first()

  if ( !opts.cdn ) throw new Error( 'cdn is required option' )
  if ( !/^https?:\/\//.test( opts.cdn ) ) throw new Error( 'invalid cdn host format' )
  
  if ( await exists( outputFullpath ) && !opts.force )
    if ( !editionInDb || editionInDb && new Date( editionInDb.update_at ) >= new Date( edition.dataUpdate ) )
      console.log( `update ${ed}` )
    else if ( opts.jumpErrors )
      return console.log( `jump ${ed} ( file exists ) and update time is grather than update time in maven` )
    else throw new Error( 'file exists' )

  if ( await exists( fullTempPath ) )
    await rmdir( fullTempPath, { recursive: true } )

  await mkdir( fullTempPath )

  if ( !await exists( opts.output ) )
    await mkdir( opts.output, { recursive: true } )

  const promises = pages.map( async ( page, index ) => {
    if ( opts.image )
      return Axios.get<fs.ReadStream>( page.img, { responseType: 'stream' } )
        .then( response => {
          const filepath = path.join( fullTempPath, `${index + 1}.jpg` )
          const writer = fs.createWriteStream( filepath )
          response.data.pipe( writer )
          type Result = { filepath: string, page: typeof page }
          return new Promise<Result>( ( resolve, reject ) => {
            writer.on( 'close', () => {
              resolve( { filepath, page } )
            } )
            writer.on( 'error', () => reject( new Error() ) )
          } )
        } )
        .catch( reason => {
          console.log( page.pdf, reason.message )
          process.exit( 1 )
        } )
    return Axios.get<fs.ReadStream>( page.pdf, { responseType: 'stream' } )
      .then( response => {
        const filepath = path.join( fullTempPath, `${index + 1}.pdf` )
        const writer = fs.createWriteStream( filepath )
        response.data.pipe( writer )
        type Result = { filepath: string, page: typeof page }
        return new Promise<Result>( ( resolve, reject ) => {
          writer.on( 'close', () => {
            resolve( { filepath, page } )
          } )
          writer.on( 'error', () => reject( new Error() ) )
        } )
      } )
      .catch( reason => {
        console.log( page.pdf, reason.message )
        process.exit( 1 )
      } )
  } )

  let infoPages = await Promise.all( promises )
  if ( opts.image ) {
    const firstPage = infoPages[0].page
    const doc = new PDFDocument( {
      margin: 0,
      autoFirstPage: false,
      size: [ Number( firstPage.width ), Number( firstPage.height ) ]
    } )
    const stream = fs.createWriteStream( outputFullpath )
    doc.pipe( stream )
    infoPages.forEach( ( { filepath, page } ) => {
      doc.addPage().image( filepath, {
        align: 'center',
        valign: 'center',
        height: Number( page.height ),
        width: Number( page.width )
      } )
    } )
    doc.end()
    await new Promise<void>( ( resolve, reject ) => {
      stream.on( 'end', () => resolve() )
      stream.on( 'error', reject )
    } )
  } else {
    const pathPages = infoPages.map( page => page.filepath )
    const pdfpath = await PDF.generate( ...pathPages )

    await new Promise<void>( ( resolve, reject ) => {
      mv( pdfpath, outputFullpath, error => error ? reject( error ) : resolve() )
    } )
  }

  const url = `${opts.cdn}${opts.cdn.endsWith( '/' ) ? '' : '/'}${name}`

  const hasEditionInDb = !!editionInDb

  const screeningDate = Times.Date.from( 'd/m/Y H:i:s', `${edition.data} 12:00:00` )

  if ( hasEditionInDb )
    await connection( 'newspaper_editions' )
      .where( 'ed_maven_number', ed )
      .update( {
        pdf_url: url,
        pdf_file_path: outputFullpath,
        updated_at: connection.fn.now()
      } )

  else
    await connection( 'newspaper_editions' )
      .insert( {
        ed_maven_number: ed,
        png_url: edition.CapaEdicao.shift(),
        pdf_url: url,
        pdf_file_path: outputFullpath,
        screening_date: screeningDate,
      } )

  const usersWithNotificationAllowed = await connection( 'users' )
    .column( 'users.id' )
    .innerJoin( 'users_metas', 'users_metas.user', 'users.id' )
    .where( 'users_metas.key', 'newspapers' )
    .where( clause => {
      clause.where( 'users_metas.value', 'true' )
      clause.orWhere( 'users_metas.value', '1' )
    } )

  const ids = usersWithNotificationAllowed.map( ( { id } ) => id )

  const replaceData = {
    screening_date: screeningDate.format( 'd/m/Y' )
  }

  const message = Object.entries<string>( replaceData )
    .reduce( ( message, [ key, value ] ) => {
      return message.replace( RegExp( `{${key}}`, 'g' ), value )
    }, opts.notificationMessage )

  const title = Object.entries<string>( replaceData )
    .reduce( ( message, [ key, value ] ) => {
      return message.replace( RegExp( `{${key}}`, 'g' ), value )
    }, opts.notificationTitle )

  if ( opts.notification ) {
    sendNotification( {
      filter: user => ids.includes( user.id ),
      notification: { title, message }
    } )
    console.log( 'send notification to users' )
  }

  console.log( `done ${ed}` )

  if ( close ) {
    connection.destroy()
    process.exit()
  }
} )

export default downloadEdition
