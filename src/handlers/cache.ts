import Express from 'express'
import memoryCache from 'memory-cache'

const cacheHandler = ( duration: number ): Express.Handler => ( req, res, next ) => {
  const key = `__express__${req.originalUrl || req.url}`
  console.log( key )
  const data = memoryCache.get( key )
  if ( data ) return res.send( data )

  // @ts-ignore
  res.sendResponse = res.send
  // @ts-ignore
  res.send = ( body ) => {
    memoryCache.put( key, body, duration )
    // @ts-ignore
    res.sendResponse( body )
  }
  next()
}

export default cacheHandler
