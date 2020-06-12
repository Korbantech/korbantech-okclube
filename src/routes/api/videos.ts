import { AxiosResponse } from 'axios'
import Express from 'express'

import wpApi from '../../helpers/wp-api'

const videos = Express.Router()

videos.get( '/videos', async ( req, res ) => {
  const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' ) + 1

  let promise: Promise<AxiosResponse<any[]>>

  const options = { params: { page, ['per-page']: limit } }

  if ( false ) return res.status( 422 ).json()

  else promise = wpApi.get( '/ndmais/v1/content/format/video/', options )

  try {
    const response = await promise
    res.json( response.data )
  } catch ( e ) {
    res.status( 500 ).json( e )
  }
} )

export default videos
