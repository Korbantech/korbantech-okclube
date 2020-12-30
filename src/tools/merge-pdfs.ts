import { exec } from 'child_process'
import path from 'path'

import Dir from '../models/Dir'
import File from '../models/File'

const jarpath = path.resolve( __dirname, '..', '..', 'jar', 'pdfbox.jar' )

const cmd = [ 'java', '-jar', jarpath, 'PDFMerger' ]

namespace PDF {
  export const check = async ( ...pdfs: string[] ) => {
    const checks = await Promise.all( pdfs.map( pdf => File.exists( pdf ) ) )
    if ( checks.some( check => check === false ) ) return Promise.resolve( false )
    return Promise.resolve( true )
  }
  export const generate = ( ...pdfs: string[] ) =>
    new Promise<string>( async ( resolve, reject ) => {
      if ( pdfs.length < 2 ) return reject( new Error() )
      if ( !await check( ...pdfs ) ) return reject( new Error() )

      const command = cmd.concat( pdfs.map( pdf => `"${pdf}"` ) )
      const output = await Dir.temp( `pdf-${Date.now().toString( 32 )}-` )
      const pdfpath = path.join( output, 'pdf.pdf' )

      command.push( `"${pdfpath}"` )

      exec( command.join( ' ' ), async err => {
        if ( err ) return reject( err )
        return resolve( pdfpath )
      } )
    } )
  export const merge = ( ...pdfs: string[] ) =>
    new Promise<Buffer>( async ( resolve, reject ) => {
      if ( pdfs.length < 2 ) return reject( new Error() )
      if ( !await check( ...pdfs ) ) return reject( new Error() )

      const command = cmd.concat( pdfs.map( pdf => `"${pdf}"` ) )
      const output = await Dir.temp( `pdf-${Date.now().toString( 32 )}-` )
      const pdfpath = path.join( output, 'pdf.pdf' )

      command.push( `"${pdfpath}"` )

      exec( command.join( ' ' ), async err => {
        if ( err ) return reject( err )
        const pdf = await File.read( pdfpath )
        await File.remove( pdfpath )
        return resolve( pdf )
      } )
    } )
    
}

export default PDF
