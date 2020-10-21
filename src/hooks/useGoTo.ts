import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import { Path } from 'history'

export const useGoToPreSet = ( path: Path, state?: any ) => {
  const goTo = useGoTo()

  return useCallback( () => goTo( path, state ), [ goTo, path, state ] )
}

const useGoTo = () => {
  const history = useHistory()

  const goTo = useCallback( ( path: Path, state?: any ) => {
    history.push( path, state )
  }, [ history ] )

  return goTo
}

export default useGoTo
