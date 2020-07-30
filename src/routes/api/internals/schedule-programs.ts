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
              .map( ( [ day, job ] ) => [ day, { 
                cron: job.cron,
                next: job.nextInvocation(),
                locale: new Date( job.nextInvocation() ).toLocaleString()
              } ] )
          ) ]
        } )
    )
    res.json( result )
  } )

route.route( '/schedule-programs/:day' )
  .get( ( req, res, next ) => {
    const day = req.params.day
    if ( !days.includes( day ) ) return next()
    const result = Object.fromEntries(
      Object.entries( scheduleStorage )
        .filter( ( [ , info ] ) => info.schedule[day] )
        .map( ( [ slug, info ] ) => [ slug, {
          cron: info.schedule[day].cron,
          next: info.schedule[day].nextInvocation(),
          locale: new Date( info.schedule[day].nextInvocation() ).toLocaleString(),
        } ] )
    )
    return res.json( result )
  } )

route.route( '/schedule-programs/:slug' )
  .get( ( req, res ) => {
    const slug = req.params.slug
    if ( !scheduleStorage[slug] ) return res.status( 404 ).json()
    const result = Object.fromEntries(
      Object.entries( scheduleStorage[slug].schedule )
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
    const day = req.params.day
    if ( !scheduleStorage[slug] || !scheduleStorage[slug].schedule[day] ) return res.status( 404 ).json()
    const job = scheduleStorage[slug].schedule[day]
    const cron = job.cron
    const next = job.nextInvocation()
    const locale = new Date( job.nextInvocation() ).toLocaleString()
    return res.json( { cron, next, locale } )
  } )
  .post( ( req, res ) => {
    const slug = req.params.slug
    const day = req.params.day
    const info = req.body
    if ( !scheduleStorage[slug] || !scheduleStorage[slug].schedule[day] ) return res.status( 404 ).json()
    const oldJob: CustomJob = scheduleStorage[slug].schedule[day]
    oldJob.cancel()
    const job = schedule.scheduleJob( oldJob.name, info, oldJob.caller )
    Object.assign( job, { caller: oldJob.caller, cron: info } )
    scheduleStorage[slug].schedule[day] = job
  } )

export default route
