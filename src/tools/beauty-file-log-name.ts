import fs from 'fs'
import path from 'path'

const beautyFileLogName = ( file: string, useTime = false ) => {
  return ( time: number | Date, index?: number ) => {
    if ( !time ) return file
    const info = path.parse( path.resolve( file ) )
    const outputpath = path.join( info.dir, info.name )
    if ( !fs.existsSync( outputpath ) ) fs.mkdirSync( outputpath )
    const date = new Date( time )
    const normalize = ( date: number, qty = 2 ) => `${Array( qty - 1 ).fill( 0 ).join( '' )}${date}`.slice( -qty )
    let prefix = `${
      date.getFullYear()
    }-${
      normalize( date.getMonth() )
    }-${
      normalize( date.getDate() )
    }-`
    if ( useTime )
      prefix += `${
        normalize( date.getHours() )
      }-${
        normalize( date.getMinutes() )
      }-${
        normalize( date.getSeconds() )
      }-${
        normalize( date.getMilliseconds(), 4 )
      }-`
    prefix += `${index}`
    const fullpath = path.join( outputpath, prefix, `${info.name}${info.ext}` )
    return fullpath
  }
}

export default beautyFileLogName
