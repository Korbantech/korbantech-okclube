import Express from 'express'

import wpApi from '../../helpers/wp-api'

const programs = Express.Router()

programs.get( '/programs', async ( req, res ) => {
  const response = await wpApi.get( '/ndmais/v1/content/filters/program' )

  res.json( response.data )
} )

export default programs
