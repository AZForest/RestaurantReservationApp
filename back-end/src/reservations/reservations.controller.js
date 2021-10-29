const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
/**
 * List handler for reservation resources
 */

async function list(req, res) {
  //const date = "2021-10-30"
  const date = req.query.date;
  const data = await reservationsService.listByDate(date);
  res.json({ data })
}

async function create(req, res, next) {
  try {
    const data = await reservationsService.create(req.body);
    res.sendStatus(201).json({ data });
  } catch (err) {
    next(err);
  }
  
}

module.exports = {
  list,
  create: asyncErrorBoundary(create)
};
