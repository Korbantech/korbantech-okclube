import Emitter from '@cookiex/emitter'
import Axios from 'axios'
import fs from 'fs'
import path from 'path'
import xml from 'xml2js'

import Dir from '../models/Dir'
import PDF from '../tools/merge-pdfs'

namespace Maven {
  export const api = Axios.create( {} )
  export const magazines = async () => {
    try {
      const response = await api.get<Magazine.Response>( '' )
      const clients = response.data.app.Cliente
      const client = clients.shift()
      const magazines = client.Revista.map( magazine => ( {
        ...magazine.$,
        editions: magazine?.Edicao?.map( edition => ( {
          ...edition.$,
          info: {
            Acesso: edition.Acesso,
            CapaEdicao: edition.CapaEdicao,
            ID: edition.ID,
            linkBrowser: edition.linkBrowser,
          }
        } ) ) ?? []
      } ) )
      const data = magazines
      return Promise.resolve( { ...response, data } )
    } catch ( e ) { return Promise.reject( e ) }
  }
  export const editions = async () => {
    try {
      const response = await magazines()
      const data = response.data.shift().editions
      return Promise.resolve( { ...response, data } )
    } catch ( e ) { return Promise.reject( e ) }
  }
  export const edition = async ( ed: string ) => {
    try {
      const response = await api.get<Edition.Response>( 'http://v4.maven.com.br/app/v3.jsp', { params: { ed } } )
      const clients = response.data.app.Cliente
      const client = clients.shift()
      const magazines = client.Revista
      const magazine = magazines.shift()
      const editions = magazine.Edicao
      const edition = editions.shift()
      const data = edition.Paginas.shift().Pagina.map( page => page.$.pdf )
      return Promise.resolve( { ...response, data } )
    } catch ( e ) { return Promise.reject( e ) }
  }
  export const download = ( ed: string ) => {
    const emitter = new Emitter<Download.Events>();

    ( async () => {
      try {
        const response = await edition( ed )

        const tmp = await Dir.temp( 'pdf-tmp-' )
        emitter.emit( 'count', response.data.length )

        const pdfs = await Promise.all( response.data.map(
          ( url, index ) => new Promise<string>( async ( resolve, reject ) => {
            const output = path.join( tmp, `${index}.pdf` )
            const writer = fs.createWriteStream( path.join( tmp, `${index}.pdf` ) )
            const response = await Axios.get( url, { responseType: 'stream' } )
            response.data.pipe( writer )
            let error: Error
            writer.on( 'error', err => {
              error = err
              writer.close()
              reject( err )
            } )
            writer.on( 'close', () => {
              emitter.emit( 'download', output )
              !error && resolve( output )
            } )
          } )
        ) )

        const pdf = await PDF.merge( ...pdfs )

        await Dir.remove( tmp, { recursive: true } )

        emitter.emit( 'done', pdf )

      } catch ( e ) { emitter.emit( 'error', e.message ) }
    } )()

    return emitter
  }
  export namespace Download {
    export interface Events {
      'count'( pages: number ): void
      'download'( page: string ): void
      'done'( pdf: Buffer ): void
      'error'( error: Error ): void
    }
  }
  export interface XMLAttribute<T> {
    $: T
  }
  export type Client<T = {}> = XMLAttribute<{
    nome: string
    ep: string
    installUrl: string
    postItUrl: string
    pushUrl: string
    registerUrl: string
    cadastroUrl: string
    forgetUrl: string
    urlForgetUsername: string
    allowRegister: string
    allowForget: string
    permissionsUrl: string
    edicoesParaVenda: string
    showCategoryName: string
    contactUrl: string
    urltheme: string
    datetheme: string // '22/08/2019 16:20:08'
    SystemBarWhite: string
    fontcolorR: string
    fontcolorG: string
    fontcolorB: string
    linecolorR: string
    linecolorG: string
    linecolorB: string
    ordemBotoes: string
  }> & T
  export type Magazine<T = {}> = XMLAttribute<{
    titulo: string
    capa: string
    capaThumb: string
    tipo: string
    prefixo: string
    periodicidade: string
    sobre: string
    cd: string
    categoria: string
    ordem: string
    lojaProdutoUrl: string
    updateUrl: string
    adMagSmart: string
  }> & T
  export type Edition<T = {}> = XMLAttribute<{
    numero: string
    titulo: string
    ed: string
    cp: string
    periodicidade: string
    metatags: string
    dataDescricao: string
    data: string
    dataEpoch: string
    dataUpdate: string
    descricao: string,
    sobre: string
    preview: string,
    adMagSmart: string,
    bytes: string
  }> & T
  export namespace Magazine {
    export interface Response {
      app: {
        Cliente: Client<{
          Revista: Magazine<{
            Edicao: Edition<{
              CapaEdicao: any[],
              linkBrowser: any[],
              ID: any[],
              Acesso: any[]
            }>[]
          }>[]
        }>[]
      }
    }
  }
  export namespace Edition {
    export interface Response {
      app: {
        Cliente: Client<{
          Revista: Magazine<{
            Edicao: Edition<{
              CapaEdicao: any[],
              linkBrowser: any[],
              ID: any[],
              Acesso: any[],
              Paginas: ( {
                Pagina: XMLAttribute<{
                  svg: string
                  pdf: string
                  img: string
                  thumb: string
                  normal: string
                  width: string
                  height: string
                  nr: string
                  id: string
                  texto: string
                  xml: string
                }>[]
              } )[],
              Indice: any[]
            }>[]
          }>[]
        }>[]
      }
    }
  }
}

Maven.api.defaults.baseURL = 'http://v4.maven.com.br/app/v3.jsp'
Maven.api.interceptors.request.use( request => {
  const params = Object.assign( { cd: '5aab3238922bcc25a6f606eb525ffdc56' }, request.params )
  return { ...request, params }
} )
Maven.api.interceptors.response.use( async response => {
  try {
    const data = await xml.parseStringPromise( response.data )
    return Promise.resolve( { ...response, data } )
  } catch ( e ) {
    console.error( e )
    return Promise.resolve( response )
  }
} )

export default Maven
