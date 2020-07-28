import { AxiosResponse } from 'axios'
import Express from 'express'

import cacheHandler from '../../handlers/cache'
import wpApi from '../../helpers/wp-api'

const videos = Express.Router()

videos.get( '/videos',
  cacheHandler( 2 * 60 * 60 * 1000, ( data, res ) => { res.json( JSON.parse( data ) ) } ),
  async ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' ) + 1
    const locations: string[] = req.query?.locations?.toString()
    .split( ',' ) || []

    let promise: Promise<AxiosResponse<any[]>>

    const options = { params: { page, ['per-page']: limit } }

    if ( locations.length )
      if ( locations.length > 1 ) return res.status( 422 ).json()
      else return promise = wpApi.get( `/ndmais/v1/content/format/video/location/${locations[0]}`, options )

    else promise = wpApi.get( '/ndmais/v1/content/format/video/', options )

    try {
      const response = await promise
      res.json( response.data )
    } catch ( e ) {
      res.status( 500 ).json( e )
    }
  } )

export default videos
