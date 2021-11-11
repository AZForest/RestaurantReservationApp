const tablesService = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const postPropValidator = (req, res, next) => {
    const { data } = req.body;
    if (!data) {
        next({
            status: 400,
            message: "Data property required"
        })
    }
    if (!data.table_name || data.table_name.length < 2) {
        next({
            status: 400,
            message: "Request must contain a table_name property longer than 1 character"
        })
    }
    if (!data.capacity || data.capacity === 0 || typeof data.capacity !== "number" ) {
        next({
            status: 400,
            message: "Request must contain a capacity property that is a number greater than zero."
        })
    }
    res.locals.table = data;
    next();
}

const updatePropValidator = (req, res, next) => {
    const { data } = req.body;
    if (!data) {
        next({
            status: 400,
            message: "Request must contain a data property"
        })
    }
    if (!data.reservation_id) {
        next({
            status: 400,
            message: "Data object must contain a reservation_id property"
        })
    }
    res.locals.reservation_id = data.reservation_id;
    next();
}

async function validateReservation(req, res, next) {
    const reservation = await tablesService.getReservation(res.locals.reservation_id);
    if (!reservation) {
        next({
            status: 404,
            message: `Reservation ${res.locals.reservation_id} does not exist`
        })
    }
    if (reservation.status === "seated") {
        next({
            status: 400,
            message: `Reservation is already seated`
        })
    }
    res.locals.reservation = reservation;
    next();
}

async function checkTableCapacity(req, res, next) {
    const { tableId } = req.params;
    const table = await tablesService.read(tableId);
    if (table.reservation_id !== null) {
        next({
            status: 400,
            message: "Table is already occupied"
        })
    }
    if (table.capacity < res.locals.reservation.people) {
        next({
            status: 400,
            message: "Table does not have sufficient capacity"
        })
    }
    next();
}

async function checkIfTableOccupied(req, res, next) {
    const { tableId } = req.params;
    const table = await tablesService.read(tableId);
    if (!table) {
        next({
            status: 404,
            message: `Table_id ${tableId} does not exist`
        })
    }
    if (table.reservation_id === null) {
        next({
            status: 400,
            message: "Table is not occupied"
        })
    }
    res.locals.table_id = tableId;
    res.locals.reservation_id = table.reservation_id;
    next();
}

async function list(req, res, next) {
    try {
        const data = await tablesService.list();
        const sortedByName = data.sort((a, b) => {
            if (a.table_name >= b.table_name) return 1;
            else return -1;
        })
        res.json({ data: sortedByName });
    } catch (err) {
        next(err);
    }
    
}

async function create(req, res, next) {
    try {
        const data = await tablesService.create(res.locals.table);
        res.status(201).json({ data })
    } catch (err) {
        console.log(err);
        next(err);
    }
}

async function update(req, res, next) {
    const { reservation_id } = res.locals;
    const table_id = parseInt(req.params.tableId);
    try {
        const data = await tablesService.update(table_id, reservation_id);
        //console.log(data);
        //res.status(200).json({ data: data });
    } catch (err) {
        console.log(err);
        next(err);
    }
    try {
        const result = await reservationsService.updateStatus(reservation_id, "seated");
        res.json({ data: result });
    } catch (err) {
        console.log(err);
    }
}

async function destroy(req, res, next) {
    try {
        const data = await tablesService.unseat(res.locals.table_id);
        //res.status(200).json({ data })
    } catch (err) {
        next(err);
    }
    try {
        const result = await reservationsService.updateStatus(res.locals.reservation_id, "finished");
        res.json({ data: result })
    } catch (err) {
        next(err);
    }
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [postPropValidator, asyncErrorBoundary(create)],
    update: [updatePropValidator, 
            asyncErrorBoundary(validateReservation), 
            asyncErrorBoundary(checkTableCapacity), 
            asyncErrorBoundary(update)],
    delete: [asyncErrorBoundary(checkIfTableOccupied), asyncErrorBoundary(destroy)]

}