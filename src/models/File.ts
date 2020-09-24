import fs from 'fs'
import path from 'path'

class File {
  private info: path.ParsedPath
  private content!: Buffer
  private status = File.Status.NOT_LOADED
  private isAscii = true

  public static exists = ( filepath: string ) =>
    new Promise<boolean>( ( resolve ) => {
      fs.exists( filepath, exists => resolve( exists ) )
    } )
  public static stat = ( filepath: string ) =>
    new Promise<fs.Stats>( ( resolve, reject ) => {
      fs.stat( filepath, ( err, data ) => err ? reject( err ) : resolve( data ) )
    } )

  public static read = ( filepath: string ) =>
    new Promise<Buffer>( ( resolve, reject ) => {
      fs.readFile( filepath, ( err, data ) => err ? reject( err ) : resolve( data ) )
    } )

  public static write = ( filepath: string, data: any, options: File.Options.write = {} ) =>
    new Promise<void>( ( resolve, reject ) => {
      fs.writeFile( filepath, data, options, err => err ? reject( err ) : resolve() )
    } )

  public static remove = ( filepath: string ) =>
    new Promise<void>( ( resolve, reject ) => {
      fs.unlink( filepath, err => err ? reject( err ) : resolve() )
    } )

  constructor( private filepath: string ) {
    this.info = path.parse( filepath )
  }

  public get name() { return this.info.base }

  public load = async () => {
    if ( this.status !== File.Status.NOT_LOADED ) return Promise.resolve( this )

    this.status = File.Status.LOADING

    const buffer = await File.read( this.filepath )

    this.isAscii = Array.from( buffer ).every( word => word <= 127 )

    this.content = buffer

    this.status = File.Status.LOADED

    return Promise.resolve( this )
  }

  public save = async ( into = this.info.dir, events: Partial<File.Save.Events> = {} ) => {
    try {
      await this.load()

      const content = this.isAscii ?
        events?.ascii?.( this.content.toString() ) ?? this.content : 
        events?.buffer?.( this.content ) ?? this.content

      const name = events?.name?.( this.info.base ) ?? this.info.base

      const fullpath = path.join( into, name )

      await File.write( fullpath, content )

      return Promise.resolve()
    } catch ( e ) { return Promise.reject( e ) }

  }
}

namespace File {
  export namespace Options {
    export type write = fs.WriteFileOptions
  }
  export namespace Save {
    export interface Events {
      ascii: ( content: string ) => string
      buffer: ( buffer: Buffer ) => Buffer
      name: ( name: string ) => string
    }
  }
  export namespace Status {
    export const NOT_LOADED = 0
    export const LOADING = 1
    export const LOADED = 2
  }
  export interface Loaded {}
}

export default File
