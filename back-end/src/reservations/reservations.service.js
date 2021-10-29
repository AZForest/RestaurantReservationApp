const knex = require("../db/connection");

function list() {
    return knex("reservations").select("*");
}

function listByDate(date) {
    return knex("reservations")
               .select("*")
               .where({ reservation_date: date })
}

function create(reservation) {
    //console.log(reservation);
    return knex("reservations")
      .insert(reservation)
      .returning("*")
      .then((createdRecords) => {
        //console.log("This is createdR: " + createdRecords)
        return createdRecords[0];
      });
}

module.exports = {
    list,
    listByDate,
    create
}