const knex = require("../db/connection");

function list() {
    return knex("tables").select("*");
}

function create(table) {
    return knex("tables")
           .insert(table)
           .returning("*")
           .then(createdRecord => {
               console.log(createdRecord[0]);
               return createdRecord[0];
           })
}

function update(tableId, reservation_id ) {
    return knex("tables")
           .where({ table_id: tableId })
           .update({ reservation_id: reservation_id }, "*")
           .then(updatedRecords => {
               //console.log(updatedRecords[0]);
               return updatedRecords[0];
           })
}

module.exports = {
    list,
    create,
    update
}