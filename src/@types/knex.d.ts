// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      created_at: string
    }

    diets: {
      id: string
      name: string
      description: string
      compliant: boolean
      created_at: string
      user_id: string
    }
  }
}
