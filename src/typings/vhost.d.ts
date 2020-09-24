declare module 'vhost' {
  import { Handler } from 'express'

  const vhost: ( test: string | RegExp, ...handlers: Handler[] ) => Handler

  export default vhost
}
