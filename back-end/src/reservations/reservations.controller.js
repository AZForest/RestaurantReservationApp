const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
/**
 * List handler for reservation resources
 */

 const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
]

const hasOnlyValidProperties = (req, res, next) => {
  //console.log("hi", req.body);
  //const { data = {} } = req.body;
  const invalidFields = Object.keys(req.body).filter(entry => {
    return !VALID_PROPERTIES.includes(entry);
  })
  if (invalidFields.length) {
    next({
      status: 400,
      message: `Invalid Field(s) => ${invalidFields.join(", ")}`
    })
  }
  next();
}

const hasRequiredProperties = (req, res, next) => {
  console.log(req.body);
  const data = req.body;
  try {
      VALID_PROPERTIES.forEach(prop => {
        if (!data[prop]) {
          const error = new Error(`A ${prop} property is required.`);
          error.status = 400;
          throw error;
        }
      })
      next();
  } catch (err) {
      next(err);
  }
}


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
  create: [hasOnlyValidProperties, hasRequiredProperties, asyncErrorBoundary(create)]
};
