import Express from 'express'

// import cacheHandler from '../../handlers/cache'
import connection from '../../helpers/connection'

const regions = Express.Router()

regions.get( '/regions',
  async ( req, res ) => {
    const regions: any[] =  await connection( 'polls' )
      .select(
        'text',
        'program',
        connection.raw( 'IF( location IS NULL, "", location ) AS name' )
      ).groupBy(
        'location'
      )
      .then( res => {
        return res
      } ).catch( err => {
        console.log( err )
        return []
      } )

    res.json( regions )
  } )


export default regions
