import Express from 'express'
import memoryCache from 'memory-cache'

interface CacheHandlerMiddleware {
  ( data: any, res: Express.Response, req: Express.Request ): void
}

const defaultCacheHandleMiddleware: CacheHandlerMiddleware =
  ( data, res ) => { res.send( data ) }

const cacheHandler = (
  duration: number,
  middle: CacheHandlerMiddleware = defaultCacheHandleMiddleware,
  prefix: string | null | ( ( req: Express.Request ) => string ) = null
): Express.Handler => ( req, res, next ) => {
  const realKey = `__express__${req.originalUrl || req.url}`
  const key = prefix
    ? typeof prefix === 'function'
      ? `${prefix( req )}${realKey}`
      : `${prefix}${realKey}`
    : realKey
  const data = memoryCache.get( key )

  if ( data ) return middle( data, res, req )

  // @ts-ignore
  req.clearCache = () => {
    memoryCache.del( `__express__${req.originalUrl || req.url}` )
  }

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
