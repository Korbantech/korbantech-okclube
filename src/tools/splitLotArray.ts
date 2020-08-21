const splitLotArray = <A extends any[]>( qty: number, array: A ): A[] => {
  const lots: A[] = []
  if ( array.length <= qty ) lots.push( array )
  else {
    const part1 = array.slice( 0, qty )
    const parts = splitLotArray( qty, array.slice( qty ) as A )
    lots.push( part1 as A, ...parts )
  }
  return lots
}

export default splitLotArray
