
exports.up = function(knex) {
  return knex.schema.table('reservations', function(table) {
      table.string('reservation_status')
  })
};

exports.down = function(knex) {
  return knex.schema.table('reservations', (table) => {
      table.dropColumn('reservation_status');
  })
};
