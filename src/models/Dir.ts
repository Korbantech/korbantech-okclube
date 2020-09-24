import fs from 'fs'
import os from 'os'
import path from 'path'

import File from './File'

class Dir {

  public static read = ( dirname: string ) =>
    new Promise<string[]>( ( resolve, reject ) => {
      fs.readdir( dirname, undefined, ( err, files ) => err ? reject( err ) : resolve( files ) )
    } )

  public static make = ( dirname: string, options: Dir.Options.mkdir = {} ) =>
    new Promise<void>( ( resolve, reject ) => {
      fs.mkdir( dirname, options, err => err ? reject( err ) : resolve() )
    } )

  public static remove = ( dirname: string, options: Dir.Options.remove = {} ) =>
    new Promise<void>( ( resolve, reject ) => {
      fs.rmdir( dirname, options, err => err ? reject( err ) : resolve() )
    } )

  public static temp = ( dirname: string ) =>
    new Promise<string>( ( resolve, reject ) => {
      fs.mkdtemp( path.join( os.tmpdir(), dirname ), ( err, folder ) => err ? reject( err ) : resolve( folder ) )
    } )

  private files!: ( Dir | File )[]

  private info: path.ParsedPath

  public status = Dir.Status.NOT_LOADED

  constructor( private dirname: string ) {
    this.info = path.parse( dirname )
  }

  public get name() { return this.info.base }

  public clear = () => {
    if ( this.status === Dir.Status.LOADING ) throw new Error()
    if ( this.status === Dir.Status.LOADED ) this.status = Dir.Status.NOT_LOADED
    this.files = []
  }

  public load = async () => {
    if ( this.status === Dir.Status.LOADED ) return Promise.resolve( this )
    this.status = Dir.Status.LOADING
    try {
      const files = await Dir.read( this.dirname )
      const maped = await Promise.all(
        files.map( async ( file ) => {
          const fullpath = path.join( this.dirname, file )
          const stat = await File.stat( fullpath )
          if ( stat.isDirectory() ) return Promise.resolve( new Dir( fullpath ) )
          if ( stat.isFile() ) return Promise.resolve( new File( fullpath ) )
          return Promise.reject( new Error( `is not dir or file: ${fullpath}` ) )
        } )
      )
      this.status = Dir.Status.LOADED
      this.files = maped
      return Promise.resolve( this )
    } catch ( e ) { return Promise.reject( e ) }
  }

  public loadAll = async () => {
    try {
      await this.load()
      await Promise.all( this.files.map( async file => file.load() ) )
      return Promise.resolve( this )
    } catch ( e ) { return Promise.reject( e ) }
  }

  public add = async ( ...files: ( Dir | File )[] ) => {
    try {
      await this.load()
      this.files.push( ...files )
      return Promise.resolve( this )
    } catch ( e ) { return Promise.reject( e ) }
  }

  public pattern = async ( ...regexps: RegExp[] ) => {
    try {
      await this.load()
      this.files = this.files.filter( file => !regexps.some( regexp => regexp.test( file.name ) ) )
      return Promise.resolve( this )
    } catch ( e ) { return Promise.reject( e ) }
  }

  public remove = async ( ...files: ( Dir | File )[] ) => {
    try {
      await this.load()
      this.files = this.files.filter( file => !files.includes( file ) )
      return Promise.resolve( this )
    } catch ( e ) { return Promise.reject( e ) }
  }

  public saveWithRoot = async ( into: string, events?: Partial<Dir.Save.Events> ) => {
    try {
      await this.load()
      await Promise.all( this.files.map( file => {
        if ( events?.ignore?.some( reg => reg.test( file.name ) ) ) return Promise.resolve()
        
        return file.save( into, events )
      } ) )
      return Promise.resolve()
    } catch ( e ) { return Promise.reject( e ) }
  }

  public save = async ( into?: string, events?: Partial<Dir.Save.Events> ) => {
    try {
      const name = events?.dir?.( this.name ) ?? this.name
      const fullpath = into ? path.join( into, name ) : name
      await this.load()
      await Dir.make( fullpath )
      await Promise.all( this.files.map( file => {
        if ( events?.ignore?.some( reg => reg.test( file.name ) ) ) return Promise.resolve()
        
        return file.save( fullpath, events )
      } ) )
      return Promise.resolve()
    } catch ( e ) { return Promise.reject( e ) }
  }
}

namespace Dir {
  export namespace Options {
    export type remove = fs.RmDirAsyncOptions
    export type mkdir = string | number | fs.MakeDirectoryOptions
  }
  export namespace Save {
    export interface Options {
      on?: Events
    }
    export interface Events extends File.Save.Events {
      dir: ( dirname: string ) => string
      ignore: RegExp[]
    }
  }
  export namespace Status {
    export const NOT_LOADED = 0
    export const LOADING = 1
    export const LOADED = 2
  }
  export interface Loaded {}
}

export default Dir
