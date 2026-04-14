import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('library_items', (table) => {
    table.dropUnique(['uuid']);
    table.unique(['uuid', 'user_id']);
  });
};

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('library_items', (table) => {
    table.dropUnique(['uuid', 'user_id']);
    table.unique(['uuid']);
  });
};
