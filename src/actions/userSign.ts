import store from '@store/index'

export const userSignIn = ( user: { email: string, password: string } ): store.Action => {
  return { type: 'INSEGURE_MERGE_STATE', data: { user } }
}

export const userSignOut = (): store.Action => {
  return { type: 'INSEGURE_MERGE_STATE', data: { user: null } }
}
