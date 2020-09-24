import { useSelector } from 'react-redux'

const useHasUser = () => useSelector( state => !!state.user )

export = useHasUser
