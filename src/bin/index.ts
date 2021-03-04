#!/usr/bin/env node
import commander from 'commander'

import { maven } from '../cli'
import { admin } from '../cli/admin'

commander.name( 'nd' )

commander.description( 'nd manage cli' )

commander.addCommand( maven )

commander.addCommand( admin )

commander.parse( process.argv )
