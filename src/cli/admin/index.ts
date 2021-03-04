import { Command } from 'commander'

import { create } from './create'

const admin = new Command( 'admin' )

admin.addCommand( create )

export { admin }
