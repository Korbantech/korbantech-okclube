import connection from '@helpers/connection'
import Axios from 'axios'
import fs from 'fs'
import path from 'path'
import url from 'url'
import { isUri } from 'valid-url'
import yargs from 'yargs'

const args = yargs.argv as any

const pdf = args.p ?? args.pdf

const image = args.i ?? args.image

const name = args.name ?? isUri( pdf )
  ? path.parse( url.parse( pdf ).pathname as string ).name
  : path.parse( image ).name

const output = args.o ?? args.output ?? path.resolve( '..', '..', 'public', 'magazines' )

const outputFullpath = path.join( output, `${name}.pdf` )

let cdn: string = args.cdn ?? 'http://d38iurctu47dce.cloudfront.net/'

const date = args.d ?? args.date ?? connection.fn.now()

if ( !pdf ) process.exit( 1 )

if ( !cdn.endsWith( '/' ) ) cdn += '/'

if ( !fs.existsSync( output ) ) fs.mkdirSync( output, { recursive: true } )

const writer = fs.createWriteStream( outputFullpath )

const pdfUrl = args.url ?? `${cdn}${name}.pdf`

if ( isUri( pdf ) )
  Axios.get( pdf, { responseType: 'stream' } )
    .then( stream => stream.data.pipe( writer ) )
else fs.createReadStream( pdf ).pipe( writer )

writer.on( 'error', err => {
  console.error( err )
  process.exit( 1 )
} )

writer.on( 'close', () => {
  console.log( 'ok' )
  connection( 'newspaper_editions' )
    .insert( {
      ed_maven_number: name,
      png_url: image,
      pdf_url: pdfUrl,
      pdf_file_path: outputFullpath,
      screening_date: date,
    } )
} )
