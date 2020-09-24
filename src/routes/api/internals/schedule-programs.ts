import Express from 'express'
import schedule from 'node-schedule'

import refreshProgramSchedule, { storage as scheduleStorage, days, CustomJob }
  from '../../../tools/refreshProgramSchedule'

const route = Express.Router()

route.route( '/schedule-programs/refresh' )
  .post( async ( req, res ) => {
    try {
      await refreshProgramSchedule()
      res.json( { refreshed: true } )
    } catch ( e ) {
      res.json( { refreshed: false } )
    }
  } )

route.route( '/schedule-programs' )
  .get( ( req, res ) => {
    const result = Object.fromEntries(
      Object.entries( scheduleStorage )
        .map( ( [ slug, info ] ) => {
          return [ slug, Object.fromEntries(
            Object.entries( info.schedule )
              .map( ( [ day, job ] ) => [ day, job ? { 
                cron: job.cron,
                next: job.nextInvocation(),
                locale: new Date( job.nextInvocation() ).toLocaleString()
              } : undefined ] )
          ) ]
        } )
    )
    res.json( result )
  } )

type WeekDays = keyof typeof scheduleStorage[string]['schedule']

route.route( '/schedule-programs/:day' )
  .get( ( req, res, next ) => {
    const day = req.params.day as WeekDays
    if ( !days.includes( day ) ) return next()
    const result = Object.fromEntries(
      Object.entries( scheduleStorage )
        .filter( ( data ) => !!data[1].schedule[day] )
        .map( ( [ slug, info ] ) => {
          const job = info.schedule[day]
          return [ slug, job ? {
            cron: job.cron,
            next: job.nextInvocation(),
            locale: new Date( job.nextInvocation() ).toLocaleString(),
          } : undefined ]
        } )
    )
    return res.json( result )
  } )

route.route( '/schedule-programs/:slug' )
  .get( ( req, res ) => {
    const slug = req.params.slug
    if ( !scheduleStorage[slug] ) return res.status( 404 ).json()
    const result = Object.fromEntries(
      Object.entries( scheduleStorage[slug].schedule )
        .filter( ( data ): data is [ string, CustomJob ] => !!data[1] )
        .map( ( [ day, job ] ) => [ day, {
          cron: job.cron,
          next: job.nextInvocation(),
          locale: new Date( job.nextInvocation() ).toLocaleString()
        } ] )
    )
    return res.json( result )
  } )
  .post( ( req, res ) => res.json() )

route.route( '/schedule-programs/:slug/:day' )
  .get( ( req, res ) => {
    const slug = req.params.slug
    const day = req.params.day as keyof typeof program.schedule
    const program = scheduleStorage[slug]
    const job = program.schedule[day]
    if ( !program || !job ) return res.status( 404 ).json()
    const cron = job.cron
    const next = job.nextInvocation()
    const locale = new Date( job.nextInvocation() ).toLocaleString()
    return res.json( { cron, next, locale } )
  } )
  .post( ( req, res ) => {
    const slug = req.params.slug
    const day = req.params.day as keyof typeof program.schedule
    const info = req.body
    const program = scheduleStorage[slug]
    const oldJob = scheduleStorage[slug].schedule[day]
    if ( !program || !oldJob ) return res.status( 404 ).json()
    oldJob.cancel()
    const job = schedule.scheduleJob( oldJob.name, info, oldJob.caller )
    const customJob = Object.assign( job, { caller: oldJob.caller, cron: info } )
    scheduleStorage[slug].schedule[day] = customJob
  } )

export default route
