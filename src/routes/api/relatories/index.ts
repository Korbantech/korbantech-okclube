import Express from 'express'

import AnsweredPolls from './answered-polls'

const relatories = Express.Router()

relatories.use( '/relatories', AnsweredPolls )

export default relatories
