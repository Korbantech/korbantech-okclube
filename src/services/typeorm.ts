import { createConnection } from 'typeorm'

import options from '../ormconfig'

const connection = createConnection( options )

export { connection }
