import { Command } from 'commander'

import download from './download'
import downloadAll from './download-all'
import info from './info'
import list from './list'
import preview from './preview'

const maven = new Command( 'maven' )

maven.addCommand( list )
maven.addCommand( preview )
maven.addCommand( info )
maven.addCommand( download )
maven.addCommand( downloadAll )

export default maven
