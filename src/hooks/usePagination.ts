import { useState, useEffect, useCallback, useMemo } from 'react'

import api from '@app/api'
import { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

const defaultResponseMapper = ( response: AxiosResponse ) => {
  if ( !Array.isArray( response.data ) ) throw new Error( '' )
  return response.data
}

const defaultParams = {}

const usePagination = <T>( url: string, {
  params = defaultParams,
  responseMapper = defaultResponseMapper,
  instace = api,
  limit = 30,
  limitParamKey = 'per-page',
  pageParamKey = 'page',
  initialPageNumber = 0,
}: usePagination.Options<T> = {} ) => {
  const [ loading, setLoading ] = useState( false )
  const [ firstLoadDone, setFirstLoadDone ] = useState( false )
  const [ list, setList ] = useState<T[]>( [] )
  const [ end, setEnd ] = useState( false )
  const [ page, setPage ] = useState( initialPageNumber )
  const [ error, setError ] = useState<null | AxiosError>( null )

  const reset = useCallback( () => {
    setPage( initialPageNumber )
    setEnd( false )
    setList( [] )
    setFirstLoadDone( false )
  }, [ initialPageNumber ] )

  useEffect( () => reset(), [ params, reset ] )

  const limitParam = useMemo( () => ( { [limitParamKey]: limit } ), [ limit, limitParamKey ] )

  const pageParam = useMemo( () => ( { [pageParamKey]: page } ), [ page, pageParamKey ] )

  const trueParams = useMemo( () => ( {
    ...params,
    ...limitParam,
    ...pageParam
  } ), [ params, limitParam, pageParam ] )

  const request = useCallback( () => instace.get( url, { params: trueParams } ), [ instace, url, trueParams ] )

  const load = useCallback( () => {
    setLoading( true )
    return request()
      .then( responseMapper )
      .then( data => {
        if ( data.length === 0 ) setEnd( true )
        setList( list => list.concat( data ) )
        setPage( page => page + 1 )
        return data
      } )
      .catch( setError )
      .finally( setLoading.bind( null, false ) )
  }, [ responseMapper, request ] )

  useEffect( () => {
    if ( !firstLoadDone && !loading )
      load().then( () => setFirstLoadDone( true ) )
  }, [ firstLoadDone, trueParams, loading, load ] )

  const pagination = useMemo( () => ( {
    list, loading, error, end, load, reset
  } ), [ list, loading, error, end, load, reset ] )

  return pagination
}

namespace usePagination {
  export interface Options<T> {
    params?: any
    responseMapper?: ( response: AxiosResponse ) => T[]
    limit?: number
    limitParamKey?: string
    pageParamKey?: string
    instace?: AxiosInstance
    initialPageNumber?: number
  }
}

export = usePagination
