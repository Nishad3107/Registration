/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('organizers', function (table) {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.timestamps(true, true);
    })
    .createTable('forms', function (table) {
      table.increments('id').primary();
      table.integer('organizer_id').unsigned().notNullable().references('id').inTable('organizers').onDelete('CASCADE');
      table.string('title', 255).notNullable();
      table.text('description');
      table.string('slug', 255).notNullable().unique();
      table.json('fields').notNullable();
      table.timestamps(true, true);
    })
    .createTable('submissions', function (table) {
      table.increments('id').primary();
      table.integer('form_id').unsigned().notNullable().references('id').inTable('forms').onDelete('CASCADE');
      table.json('data').notNullable();
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('submissions')
    .dropTableIfExists('forms')
    .dropTableIfExists('organizers');
};