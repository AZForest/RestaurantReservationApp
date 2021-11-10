
exports.up = function(knex) {
  return knex.schema.table('reservations', function(table) {
      table.string('status')
  })
};

exports.down = function(knex) {
  return knex.schema.table('reservations', (table) => {
      table.dropColumn('status');
  })
};
