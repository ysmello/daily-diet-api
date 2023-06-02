import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('diets', (table) => {
    table.boolean('compliant').notNullable().index()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('diets', (table) => {
    table.dropColumn('compliant')
  })
}
