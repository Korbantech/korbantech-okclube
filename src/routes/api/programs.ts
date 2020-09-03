import { AxiosResponse } from 'axios'
import Express from 'express'
import memoryCache from 'memory-cache'

import cacheHandler from '../../handlers/cache'
import connection from '../../helpers/connection'
import wpApi from '../../helpers/wp-api'

const programs = Express.Router()

programs.get( '/programs',
  cacheHandler(
    1 * 60 * 60 * 1000,
    ( data, res ) => res.json( JSON.parse( data ) ),
    ( req ) => `programs_to_${req.query?.user?.toString()}`
  ),
  async ( req, res ) => {
    const locations: string[] = req.query?.locations?.toString()
    .split( ',' ) || []

    const user: string | null = req.query?.user?.toString() || null

    let promise: Promise<AxiosResponse<any[]>>

    if ( locations.length )

      if ( locations.length > 1 ) return res.status( 422 ).json()

      else promise = wpApi.get( `/ndmais/v1/content/filters/program/location/${locations[0]}` )

    else promise = wpApi.get( '/ndmais/v1/content/filters/program' )

    const response = await promise

    if ( !user ) return res.json( response.data )

    const ids: number[] = ( await connection( 'favorite_programs' )
      .select()
      .where( 'user', user )
      .whereIn( 'program', response.data.map( program => program.ID ) ) )
      .map( ( { program } ) => program )

    console.log( ids )

    const programs = response.data.map( program => {
      if ( ids.includes( program.ID ) )
        return { ...program, favorite: true }
      return { ...program, favorite: false }
    } )
  
    res.json( programs )
  } )

programs.post( '/programs/favorite', async ( req, res ) => {
  if ( !req.body.user || !req.body.program ) return res.status( 422 ).json()

  memoryCache.keys().filter( key => {
    if ( typeof key === 'string' )
      if ( key.startsWith( `programs_to_${req.body.user}` ) ) return true
    return false
  } ).forEach( key => memoryCache.del( key ) )

  await connection( 'favorite_programs' )
    .insert( req.body )

  return res.json()
} )

programs.delete( '/programs/favorite', async ( req, res ) => {
  if ( !req.body.user || !req.body.program ) return res.status( 422 ).json()

  memoryCache.del( `programs_to_${req.body.user}` )

  await connection( 'favorite_programs' )
    .delete()
    .where( req.body )

  return res.json()
} )

export default programs
