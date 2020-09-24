import { useState, useCallback, useMemo } from 'react'

import api from '@app/api'
import { AxiosError, AxiosResponse } from 'axios'

const defaultParams = {}

const useRequest = <T extends any>( url: string, params: any = defaultParams ) => {
  const [ loading, setLoading ] = useState( false )
  const [ error, setError ] = useState<AxiosError | null>( null )
  const [ data, setData ] = useState<T | null>( null )
  const [ response, setResponse ] = useState<AxiosResponse<T> | null>( null )
  const [ init, setInit ] = useState( false )

  const request = useCallback( () => {
    setLoading( true )
    api.get<T>( url, { params } )
      .then( response => {
        setResponse( response )
        setData( response.data )
      } )
      .catch( setError )
      .finally( setLoading.bind( null, false ) )
  }, [ url, params ] )

  const send = useCallback( () => {
    if ( !response || !error ) {
      setInit( true )
      request()
    }
  }, [ request, response, error ] )

  return useMemo(
    () => ( { data, response, loading, error, send, init } ),
    [ data, response, loading, error, send, init ] )
}

export = useRequest
