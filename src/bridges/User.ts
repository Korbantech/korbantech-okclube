import Bridge from '@cookiex/typeorm-bridge'

import { subscriptionApi, DocumentConsultData } from '@services/subscriptionApi'
import { compare } from 'bcrypt'

type M = typeof import( '@entities/User' )['User']
type I = Bridge.Instance<M, S, P>
interface S {
  findOneByCredential( email: string, password: string ): Promise<-1 | 0 | I>
  findOneByEmail( email: string ): Promise<I | undefined>
}
interface P {
  hasUpdateInSubscription(): Promise<boolean>
  updateSubscription(): Promise<this>
}

const User = Bridge.create<M, S, P>( {
  target: () => import( '@entities/User' ).then( module => module.User ),
  axios: () => import( '@services/api' ).then( module => module.default ),
  uri: 'users',
  static: {
    async findOneByCredential(
      email: string,
      password: string,
    ) {
      const user = await this.findOneByEmail( email )
      if ( !user ) return -1 as const
      if ( !await compare( password, user.password ) ) return 0 as const
      return user
    },
    findOneByEmail( email: string ) {
      return this.findOne( null, { where: { email } } )
    }
  },
  prototype: {
    async hasUpdateInSubscription() {
      const response = await subscriptionApi.get<DocumentConsultData>( this.document )
      if ( !response.data ) return false

      if ( !this.subscriptionValidity ) return true

      const { dataDeValidade } =
        response.data.find( item => item.identMF === this.document )

      const validity = new Date( dataDeValidade )

      return this.subscriptionValidity.getTime() !== validity.getTime()
    },
    async updateSubscription() {
      if ( !await this.hasUpdateInSubscription() ) return this

      const response = await subscriptionApi.get<DocumentConsultData>( this.document )

      const { dataDeValidade, codigoDaPessoaAssinante, tipo } =
        response.data.find( item => item.identMF === this.document )

      this.subscriptionValidity = new Date( dataDeValidade )
      this.subscriptionCode = codigoDaPessoaAssinante,
      this.subscriptionType = tipo

      return this
    }
  },
} )

export { User }
