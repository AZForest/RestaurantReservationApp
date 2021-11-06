const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res, next) {
    try {
        const data = await tablesService.list();
        res.json({ data });
    } catch (err) {
        next(err);
    }
    
}

async function create(req, res, next) {
    //console.log(req.body.data);
    try {
        const data = await tablesService.create(req.body.data);
        res.status(201).json({ data })
    } catch (err) {
        console.log(err);
        next(err);
    }
}

async function update(req, res, next) {
    //console.log(req.body.data);
    //console.log(req.params);
    const { reservation_id } = req.body.data;
    const table_id = parseInt(req.params.tableId);
    try {
        const data = await tablesService.update(table_id, reservation_id);
        //console.log(data);
        res.status(204).json({ data: data });
    } catch (err) {
        console.log(err);
        next(err);
    }
    //res.send("hi")
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: asyncErrorBoundary(create),
    update: asyncErrorBoundary(update)
}