import React, { useRef, useCallback } from 'react'

const InputWithDelay = ( {
  onChange: onChangeProps,
  delay = 500,
  ...props
}: InputWithDelay.Props ) => {
  const timeout = useRef<number>( 0 )

  const onChange = useCallback( ( event: InputWithDelay.ChangeEvent ) => {
    event.persist()
    if ( timeout.current ) clearTimeout( timeout.current )
    timeout.current = setTimeout( () => {
      timeout.current = 0
      onChangeProps?.( event )
    }, [ delay ] )
  }, [ delay, onChangeProps ] )

  return <input onChange={ onChange } {...props} />
}

namespace InputWithDelay {
  export type ChangeEvent = React.ChangeEvent<HTMLInputElement>
  export type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  export type OnChange = ( event: ChangeEvent ) => void
  export interface Props extends InputProps {
    delay?: number
  }
}

export default InputWithDelay
