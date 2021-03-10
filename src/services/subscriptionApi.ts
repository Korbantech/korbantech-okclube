import beautyFileLogName from '@tools/beauty-file-log-name'
import Axios from 'axios'
import * as logger from 'axios-logger'
import stringBuilder from 'axios-logger/lib/common/string-builder'
import * as rfs from 'rotating-file-stream'

type StandardDocumentData = {
  tipo: string
  codigoDaPessoaAssinante: number
  nomeDoAssinante: string
  dataDeValidade: string
  identMF: string
  email: string
  nomeDoBeneficario: string
}

export type DocumentConsultData = StandardDocumentData[] | null

stringBuilder.prototype.makeLogTypeWithPrefix = function ( logType: string ) {
  const prefix = this.config.prefixText === false
    ? `[${logType}]`
    : `[${this.config.prefixText || 'Axios'}][${logType}]`
  this.printQueue.push( prefix )
  return this
}
stringBuilder.prototype.makeMethod = function( method?: string ) {
  if ( this.config.method && method )
    this.printQueue.push( method.toUpperCase() )
  return this
}
stringBuilder.prototype.makeStatus = function( status?: number, statusText?: string ) {
  if ( this.config.status && this.config.statusText && status && statusText )
    this.printQueue.push( `${status}:${statusText}` )
  else if ( this.config.status && status )
    this.printQueue.push( `${status}` )
  else if ( this.config.statusText && statusText )
    this.printQueue.push( statusText )
  return this
}

const stream = rfs.createStream( beautyFileLogName( 'logs/subscription/requests.log' ) )

logger.setGlobalConfig( {
  prefixText: false,
  data: false,
  headers: false,
  method: true,
  status: true,
  statusText: false,
  url: true,
  dateFormat: 'HH:MM:ss',
  logger: stream.write.bind( stream ),
} )

const subscriptionApi = Axios.create( {
  baseURL: 'https://sac.ndonline.com.br/clubedoassinante/rest/clube/dados/identmf/'
} )

subscriptionApi.interceptors.request.use( logger.requestLogger, logger.errorLogger )
subscriptionApi.interceptors.response.use( response => {
  const data: [ StandardDocumentData, ...StandardDocumentData[] ] = response.data

  if ( data.length === 1 )
    if ( data[0].codigoDaPessoaAssinante === 0 ) response.data = null
  
  return logger.responseLogger( response )
}, logger.errorLogger )

export { subscriptionApi }
