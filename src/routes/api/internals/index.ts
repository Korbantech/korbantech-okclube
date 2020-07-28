import Express from 'express'

import customNotification from './custom-notification'
import schedulePrograms from './schedule-programs'

const internals = Express.Router()

internals.use( '/internals', schedulePrograms )
internals.use( '/internals', customNotification )

export default internals
