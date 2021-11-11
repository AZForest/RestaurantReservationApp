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
        //console.log(createdRecords)
        return createdRecords[0];
      });
}

function read(reservation_id) {
  return knex("reservations")
         .select("*")
         .where({ reservation_id })
         .first();
}

function updateStatus(reservationId, status) {
  return knex("reservations")
         .where({ reservation_id: reservationId })
         .update({ status: status }, "*")
         .then(uR => {
           return uR[0];
         })


}

module.exports = {
    list,
    listByDate,
    create,
    read,
    updateStatus
}