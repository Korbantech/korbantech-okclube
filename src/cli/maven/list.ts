import Maven from '@helpers/maven'
import { Command } from 'commander'

const list = new Command( 'list' )

list.alias( 'ls' )

list.option( '--year <year>', 'list all edition in especifc year' )

list.action( () => {
  const opts = list.opts()
  Maven.editions( opts.year )
    .then( ( { data } ) => data )
    .then( editions => {
      if ( !editions || !editions.length )
        return console.log( 'not found editions' )
      editions.forEach( edition => {
        const createdAt = new Date( parseInt( edition.dataEpoch, 10 ) ).toLocaleString()
        const updatedAt = new Date( parseInt( edition.dataUpdate, 10 ) ).toLocaleString()
        console.log(
          `${edition.numero}\t${edition.ed}\t${createdAt}\t${updatedAt}\t${edition.titulo}`
        )
      } )
    } )
} )

export default list
