const knex = require("../db/connection");

function list() {
    return knex("tables").select("*");
}

function read(table_id) {
    return knex("tables")
           .select("*")
           .where({ table_id: table_id })
           .then(foundRecords => foundRecords[0])
}

function create(table) {
    return knex("tables")
           .insert(table)
           .returning("*")
           .then(createdRecord => {
               //console.log(createdRecord[0]);
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

function unseat(tableId) {
    return knex("tables")
           .where({ table_id: tableId })
           .update({ reservation_id: null }, "*")
           .then(uR => {
               return uR[0];
           })
}

function getReservation(reservationId) {
    return knex("reservations")
           .select("*")
           .where({ reservation_id: reservationId })
           .then(updatedRecords => updatedRecords[0]);
}

module.exports = {
    list,
    read,
    create,
    update,
    unseat,
    getReservation
}