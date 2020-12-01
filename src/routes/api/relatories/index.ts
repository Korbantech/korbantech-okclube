import Express from 'express'

import answeredPolls from './answered-polls'
import coupons from './coupons'

const relatories = Express.Router()

relatories.use( '/relatories', answeredPolls )
relatories.use( '/relatories', coupons )

export default relatories
