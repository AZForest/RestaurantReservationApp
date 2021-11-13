const tablesController = require("../../tables/tables.controller");

exports.up = function(knex) {
  return knex.schema.alterTable('reservations', (table) => {
    table.date("reservation_date").alter();
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('reservations', (table) => {
    table.string("reservation_date").alter();
  })
};
