
exports.up = function(knex) {
    return knex.schema.alterTable('reservations', (table) => {
      table.time("reservation_time").alter();
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('reservations', (table) => {
      table.string("reservation_time").alter();
    })
  };
