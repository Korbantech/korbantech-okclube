import { AxiosResponse } from 'axios'
import Express from 'express'

import connection from '../../helpers/connection'
import wpApi from '../../helpers/wp-api'

const programs = Express.Router()

programs.get( '/programs', async ( req, res ) => {
  const locations: string[] = req.query?.locations?.toString()
    .split( ',' ) || []

  const user: string | null = req.query?.user?.toString() || null

  let promise: Promise<AxiosResponse<any[]>>

  if ( locations.length )

    if ( locations.length > 1 ) return res.status( 422 ).json()

    else promise = wpApi.get( `/ndmais/v1/content/filters/program/location/${locations[0]}` )

  else promise = wpApi.get( '/ndmais/v1/content/filters/program'  )

  const response = await promise

  if ( !user ) return res.json( response.data )

  const ids: number[] = ( await connection( 'favorite_programs' )
    .select()
    .where( 'user', user )
    .whereIn( 'program', response.data.map( program => program.ID ) ) )
    .map( ( { program } ) => program )

  const programs = response.data.map( program => {
    if ( ids.includes( program.ID ) )
      return { ...program, favorite: true }
    return { ...program, favorite: false }
  } )
  
  res.json( programs )
} )

programs.post( '/programs/favorite', async ( req, res ) => {
  if ( !req.body.user || !req.body.program ) return res.status( 422 ).json()

  await connection( 'favorite_programs' )
    .insert( req.body )

  return res.json()
} )

programs.delete( '/programs/favorite', async ( req, res ) => {
  if ( !req.body.user || !req.body.program ) return res.status( 422 ).json()

  await connection( 'favorite_programs' )
    .delete()
    .where( req.body )

  return res.json()
} )

export default programs
