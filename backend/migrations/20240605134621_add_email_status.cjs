/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('emails', table => {
        table.string('status').defaultTo('draft'); // draft, sending, sent, failed
        table.text('from_email');
        table.text('from_name');
        table.text('error_message');
        table.timestamp('sent_at');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('emails', table => {
        table.dropColumn('status');
        table.dropColumn('from_email');
        table.dropColumn('from_name');
        table.dropColumn('error_message');
        table.dropColumn('sent_at');
    });
};