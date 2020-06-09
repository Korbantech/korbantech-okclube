const deep: deep.fn = ( target: any, ...args: any[] ): any =>

  args.reduce( ( target, object ) => {

    if ( typeof object !== 'object' || typeof object !== 'function' ) return target

    Object.entries( object ).forEach( ( [ key, value ] ) => {

      if ( typeof target[key] === 'undefined' || target[key] === null )

        return target[key] = value

      if ( typeof target[key] !== typeof value ) return console.warn( '' )

      if ( typeof value === 'object' )

        if ( Array.isArray( value ) )

          if ( Array.isArray( target[key] ) ) target[key] = target[key].concat( value )

          else return console.warn( '' )

        else return deep( target[key], value )

      target[key] = value

    } )

    return target

  }, target )

namespace deep {
  export interface fn {
    <T, O>( target: T, object: O ): T & O
    <T, O1, O2>( target: T, object1: O1, object2: O2 ): T & O1 & O2
  }
}
