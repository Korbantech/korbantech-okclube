import os from 'os'
import * as rfs from 'rotating-file-stream'
import { Logger as TypeORMLogger } from 'typeorm'

import beautyFileLogName from '../beauty-file-log-name'

const stringify = ( parameters?: any[] ) => {
  try { return JSON.stringify( parameters ) } catch { return parameters }
}

const queryStringify = ( query: string, parameters?: any[] ) =>
  `${query}${ parameters && parameters.length ? ` -- PARAMETERS: ${stringify( parameters )}` : '' }`

interface Streams extends Record<'query' | 'log' | 'info' | 'warn' | 'error', rfs.RotatingFileStream> {}

class Logger implements TypeORMLogger {
  protected streams: Streams = {
    query: rfs.createStream( beautyFileLogName( 'logs/orm/query.log' ), { interval: '1d' } ),
    log: rfs.createStream( beautyFileLogName( 'logs/orm/log.log' ), { interval: '1d' } ),
    info: rfs.createStream( beautyFileLogName( 'logs/orm/info.log' ), { interval: '1d' } ),
    warn: rfs.createStream( beautyFileLogName( 'logs/orm/query-warning.log' ), { interval: '1d' } ),
    error: rfs.createStream( beautyFileLogName( 'logs/orm/query-error.log' ), { interval: '1d' } ),
  }

  public logQuery( query: string, parameters?: any[] ) {
    this.write( 'query', queryStringify( query, parameters ) )
  }

  public logQueryError( error: string, query: string, parameters?: any[] ) {
    this.write( 'error', [
      `[FAILED QUERY]: ${queryStringify( query, parameters )}`,
      `[QUERY ERROR]: ${error}`
    ] )
  }
  public logQuerySlow( time: number, query: string, parameters?: any[] ) {
    this.write( 'warn', `[SLOW QUERY: ${time} ms] ${queryStringify( query, parameters )}` )
  }
  public logSchemaBuild( message: string ) {
    this.write( 'info', message )
  }
  public logMigration( message: string ) {
    this.write( 'info', message )
  }
  public log( level: 'log' | 'info' | 'warn', message: any ) {
    this.write( level, message )
  }

  protected write( stream: keyof Streams, text: string | string[] ) {
    const texts = Array.isArray( text ) ? text : [ text ]
    this.streams[stream].write(
      `${texts.map( text => `[${new Date().toISOString()}] ${text}` ).join( os.EOL )}${os.EOL}`
    )
  }
}

export default Logger
