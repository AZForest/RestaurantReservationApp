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
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(entry => {
    return !VALID_PROPERTIES.includes(entry);
  })
  if (invalidFields.length) {
    next({
      status: 400,
      message: `Invalid Field(s) => ${invalidFields.join(", ")}`
    })
  }
  res.locals.data = data;
  next();
}

const hasRequiredProperties = (req, res, next) => {
  try {
      VALID_PROPERTIES.forEach(prop => {
        if (!res.locals.data[prop]) {
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

const validateDateTimePeople = (req, res, next) => {
  const { reservation_date: date, reservation_time: time, people } = res.locals.data;
  if (new Date(date) === "Invalid Date" || isNaN(new Date(date))) {
    next({
      message: "Invalid reservation_date",
      status: 400
    })
  }
  let pattern = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
  if (!pattern.test(time)) {
    next({
      message: "Invalid reservation_time",
      status: 400
    })
  }
  if (typeof people !== "number") {
    next({
      message: "people must be a number",
      status: 400
    })
  }
  next();
}


async function list(req, res, next) {
  try { 
    //const date = "2021-10-30"
    const date = req.query.date;
    const data = await reservationsService.listByDate(date);
    if (data.length > 1) {
      const sortedByTime = data.sort((a,b) => {
        const aTime = a.reservation_time.split(":");
        const aSeconds = (parseInt(aTime[0]) * 60 * 60) + (parseInt(aTime[1]) * 60);
        const bTime = b.reservation_time.split(":");
        const bSeconds = (parseInt(bTime[0]) * 60 * 60) + (parseInt(bTime[1]) * 60);
        return aSeconds - bSeconds;
      })
      res.json({ data: sortedByTime })
    } else {
      res.json({ data })
    }
    
    
  } catch(err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await reservationsService.create(res.locals.data);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
  
}

module.exports = {
  list,
  create: [hasOnlyValidProperties, hasRequiredProperties, validateDateTimePeople, asyncErrorBoundary(create)]
};
