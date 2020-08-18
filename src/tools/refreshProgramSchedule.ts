import fs from 'fs'
import schedule from 'node-schedule'
import os from 'os'

import { IS_DEVELOPER_ENVIRONMENT } from '../constants'
import connection from '../helpers/connection'
import firebase from '../helpers/firebase'
import transport from '../helpers/transport'
import wpApi from '../helpers/wp-api'


export interface CustomJob extends schedule.Job {
  cron: string
  caller: () => Promise<void>
}

export const storage: { [key: string]: {
  schedule: {
    sunday?: CustomJob
    friday?: CustomJob
    monday?: CustomJob
    thursday?: CustomJob
    tuesday?: CustomJob
    wednesday?: CustomJob
    saturday?: CustomJob
  }
} } = {}

export interface NormalizedProgram {
  slug: string,
  id: number,
  name: string,
  schedule: {
    sunday?: string
    friday?: string
    monday?: string
    thursday?: string
    tuesday?: string
    wednesday?: string
    saturday?: string
  }
}

const bgsIds = [ 183149, 183146, 183148, 754493, 183157, 1096523, 1075190 ]

const normalizePrograms = ( programs: any[] ): NormalizedProgram[] =>
  programs
    .filter( program => program.has_streaming && !bgsIds.includes( program.ID ) )
    .map( ( program: any ) => ( {
      slug: program.slug,
      id: program.ID,
      name: program.ID === 183155 ? 'Balanço Geral' : program.name,
      schedule: Object.fromEntries(
        Object.entries( program.schedule )
          .map( ( [ key, value ] ) => [ key.replace( /^schedule_/, '' ), value[0] ] )
      )
    } ) )

export const days = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ]

const logger = fs.createWriteStream( 'notifications.log' )

const createJobFromEntry = ( program: NormalizedProgram, day: string, time: string ) => {
  const [ hour, min ] = time.split( ':' )
  const cron = `${min} ${hour} * * ${days.indexOf( day )}`
  const caller = async ( date: Date ) => {
    const collections = await firebase.firestore().collection( 'users' ).get()
    const firebaseUsers: { id: number, token: string }[] = []

    collections.forEach( user => firebaseUsers.push( user.data() as any ) )

    const users = await connection( 'users' )
      .innerJoin( 'favorite_programs', 'favorite_programs.user', 'users.id' )
      .where( 'favorite_programs.program', program.id )
      .whereIn( 'users.id', firebaseUsers.filter( Boolean ).map( user => user.id ) )

    const tokens = firebaseUsers
      .filter( fuser => users.some( user => fuser.id === user.id || fuser === null ) )
      .map( fuser => fuser.token )

    const response = await firebase.messaging().sendToDevice( tokens, {
      notification: {
        title: `${program.name}`,
        body: `O programa ${program.name} está no ar`
      }
    } )

    const log =
      `[${date.toLocaleString()}]` +
      `[success]${response.successCount}` +
      `[failure]${response.failureCount}` +
      `[messages](${os.EOL}${response.results.map( result =>
        '  ' + 
        `[token]${result.canonicalRegistrationToken}` +
        `[error]${!!result.error?.message}` +
        result.error?.message ?
          `[code]${result.error?.code}` +
          `[message]${result.error?.message}` +
          `[stack]${result.error?.stack}` :
          ''
      ).join( os.EOL )})` +
      os.EOL + os.EOL

    logger.write( log )

    await transport.sendMail( {
      from: 'devkorbantech@gmail.com',
      to: [ 'antonio@korbantech.com.br', 'aws@korbantech.com.br' ],
      subject: `Notification details of ${program.name}(${program.id})`,
      html: `
        <table>
          <tr>
            <td>Success</td>
            <td>Faileds</td>
          </tr>
          <tr>
            <td>${response.successCount}</td>
            <td>${response.failureCount}</td>
          </tr>
        </table>
        <table>
          <thead>
            <tr>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            ${response.results.map( result => `
              <tr>
                <td>
                  [${result.error.code}]${result.error.message}
                </td>
              </tr>
            ` ).join( ' ' )}
          </tbody>
        </table>
      `,
    } )
  }
  const job = schedule.scheduleJob( `${program.slug}_${day}`, cron, caller )
  Object.assign( job, { cron, caller } )
  return [ day, job ] as const
}

const refreshProgramSchedule = async () => {
  Object.entries( storage ).forEach( ( [ slug, program ] ) => {
    Object.values( program.schedule )
      .forEach( schedule => {
        Object.values( schedule ).forEach( job => job.cancel() )
      } )
    delete storage[slug]
  } )
  const response = await wpApi.get( '/ndmais/v1/content/filters/program' )
  const programs = normalizePrograms( Array.from( response.data ) )
  programs.forEach( program => {
    storage[program.slug] = {
      schedule: Object.fromEntries(
        Object.entries( program.schedule )
          .filter( ( [ day ] ) => days.includes( day ) )
          .map( ( [ day, time ] ) => createJobFromEntry( program, day, time ) )
      ),
    }
  } )
}

export default refreshProgramSchedule

if ( !IS_DEVELOPER_ENVIRONMENT ) refreshProgramSchedule()
