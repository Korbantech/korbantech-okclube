#!/usr/bin/env node
import commander from 'commander'

import { maven } from '../cli'

commander.name( 'nd' )

commander.description( 'nd manage cli' )

commander.addCommand( maven )

commander.parse( process.argv )
