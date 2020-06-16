import { AxiosResponse } from 'axios'
import Express from 'express'

import wpApi from '../../helpers/wp-api'

const programs = Express.Router()

programs.get( '/programs', async ( req, res ) => {
  const locations: string[] = req.query?.locations?.toString()
    .split( ',' ) || []

  let promise: Promise<AxiosResponse>

  if ( locations.length )

    if ( locations.length > 1 ) return res.status( 422 ).json()

    else promise = wpApi.get( `/ndmais/v1/content/filters/program/location/${locations[0]}` )

  else promise = wpApi.get( '/ndmais/v1/content/filters/program'  )

  const response = await promise

  res.json( response.data )
} )

export default programs
