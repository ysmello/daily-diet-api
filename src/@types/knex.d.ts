// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
    }

    diets: {
      name: string
      description: string
      compliant: boolean
      created_at: string
      user_id: string
    }
  }
}
