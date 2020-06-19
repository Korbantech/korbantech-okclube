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

  const formats: string[] = req.query?.formats?.toString()
    .split( ',' ) || []

  const programs: string[] = req.query?.programs?.toString()
    .split( ',' ) || []

  const search: string | undefined = req.query?.search?.toString() || undefined

  let promise: Promise<AxiosResponse<any[]>>

  const options = { params: { page, ['per-page']: limit, search } }

  if ( programs.length )

    if ( programs.length > 1 ) return res.status( 422 ).json()

    else promise = wpApi.get( `/ndmais/v1/content/program/${programs[0]}`, options )

  else if ( categories.length )

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

    else if ( formats.length )

      if ( formats.length > 1 ) return res.status( 422 ).json()

      else promise = wpApi.get( `/ndmais/v1/content/format/${formats[0]}/location/${locations[0]}`, options )

    else promise = wpApi.get<any[]>( `/ndmais/v1/content/location/${locations[0]}`, options )
  
  else if ( formats.length )

    if ( formats.length > 1 ) return res.status( 422 ).json()
    
    else promise = wpApi.get( '/ndmais/v1/content/format/video/', options )

  else promise = wpApi.get<any[]>( '/ndmais/v1/content/', options )
  
  try {
    const { data } = await promise
    res.json( data )
  } catch ( e ) {
    res.json( e )
  }
} )

news.get( '/news/:id', async ( req, res ) => {
  if ( !req.params.id ) return res.status( 422 ).json()
  try {
    const response = await wpApi.get<any>( `/ndmais/v1/content/${req.params.id}` )
    res.json( response.data )
  } catch ( e ) {
    res.json( e )
  }
} )

export default news
