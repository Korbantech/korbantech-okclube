import Emitter from '@cookiex/emitter'
import ws from 'ws'

const emitter = new Emitter<WebSocketManager.Events>()

const connections: ws[] = []

const send = ( data: any ) => {
  connections.forEach( connection => {
    connection.send( JSON.stringify( data ) )
  } )
}

emitter.on( 'message', ( title, message ) => send( { type: 'basic-message', title, message } ) )
emitter.on( 'program', ( name, at ) => send( { type: 'program-message', name, at } ) )

const WebSocketManager = new class {
  public add = ( connection: ws ) => {
    connections.push( connection )
    connection.on( 'close', () => this.delete( connection ) )
  }
  public delete = ( connection: ws ) => {
    connections.splice( connections.indexOf( connection ), 1 )
  }
  public send = {
    message: ( title: string, message: string ) => emitter.emit( 'message', title, message )
  }
}

namespace WebSocketManager {
  export interface Events {
    message( title: string, message: string ): void
    program( name: string, at: Date ): void
  }
}

export default WebSocketManager
