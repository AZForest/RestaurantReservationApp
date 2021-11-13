const knex = require("../db/connection");

function list() {
    return knex("reservations").select("*");
}

function listByDate(date) {
    return knex("reservations")
               .select("*")
               .where({ reservation_date: date })
}

function listByMobileNumber(mobile_number) {
  return knex("reservations")
         .select("*")
         .where({ mobile_number: mobile_number })
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
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

function updateReservation(updatedReservation) {
  return knex("reservations")
         .select("*")
         .where({ reservation_id: updatedReservation.reservation_id })
         .update(updatedReservation, "*")
         .then(uR => {
           return uR[0];
         })
}

module.exports = {
    list,
    listByDate,
    listByMobileNumber,
    search,
    create,
    read,
    updateStatus,
    updateReservation
}