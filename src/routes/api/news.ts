import { AxiosResponse } from 'axios'
import Express from 'express'

import wpApi from '../../helpers/wp-api'

const news = Express.Router()

news.get( '/news', async ( req, res ) => {
  const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' ) + 1
  const categories: string[] = req.query?.categories?.toString()
    .split( ',' ) || []
  const locations: string[] = req.query?.locations?.toString()
    .split( ',' ) || []

  let promise: Promise<AxiosResponse<any[]>>

  const options = { params: { page, ['per-page']: limit } }

  if ( categories.length )

    if ( categories.length > 1 ) return res.status( 422 ).json()

    else if ( locations.length )

      if ( locations.length > 1 ) return res.status( 422 ).json()

      else promise = wpApi.get<any[]>(
        `/ndmais/v1/content/category/${categories[0]}/location/${locations[0]}/`,
        options
      )

    else promise = wpApi.get<any[]>( `/ndmais/v1/content/category/${categories[0]}`, options )

  else if ( locations.length )

    if ( locations.length > 1 ) return res.status( 422 ).json()

    else promise = wpApi.get<any[]>( `/ndmais/v1/content/location/${locations[0]}`, options )

  else promise = wpApi.get<any[]>( '/ndmais/v1/content/', options )
  
  try {
    const { data } = await promise
    res.json( data )
  } catch ( e ) {
    res.json( e )
  }
} )

news.get( '/news/:id', async ( req, res ) => {
  if ( !req.query.id ) return res.status( 422 ).json()
  try {
    const response = await wpApi.get<any>( `/ndmais/v1/content/${req.query.id}` )
    res.json( response.data )
  } catch ( e ) {
    res.status( 500 ).json( e )
  }
} )

export default news
