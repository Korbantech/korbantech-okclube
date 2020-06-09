const ifBrowser = <R1, R2>(
  ifBrowser: () => R1,
  elseServer: () => R2
) => {
  if ( typeof window !== 'undefined' ) return ifBrowser()
  else return elseServer()
}

export default ifBrowser
