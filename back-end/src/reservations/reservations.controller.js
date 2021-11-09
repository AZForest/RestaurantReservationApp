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

//US-01
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

//US-02
const validateTargetDate = (req, res, next) => {
  const { reservation_date: date, reservation_time: time } = res.locals.data;
  const targetDate = new Date(date);
  if (targetDate.getDay() === 1) {
    next({
      message: "Restaurant is closed on Tuesdays.",
      status: 400
    })
  }
  if (Date.now() > targetDate.getTime()) {
    next({
      message: "Reservation must be in the future.",
      status: 400
    })
  }
  let timeArray = time.split(":");
  let timeToInt = parseInt(timeArray.reduce((acc, cur) => {
      return acc + cur;
  }, ""));
  let openingTime = 1030, closingTime = 2130;
  if (timeToInt < openingTime || timeToInt > closingTime) {
    next({
      message: 'Reservation must be between 10:30am and 9:30pm',
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
  res.locals.data.reservation_status = 'booked';
  try {
    const data = await reservationsService.create(res.locals.data);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function read(req, res, next) {
  console.log(req.params.reservationId);
  const { reservationId } = req.params;
  try {
    const data = await reservationsService.read(parseInt(reservationId));
    res.json({ data })
  } catch(err) {
    next(err);
  }
}

async function update(req, res, next) {
  const { reservationId } = req.params;
  const { status } = req.body.data;
  console.log(reservationId);
  console.log(status);
  try {
    const data = await reservationsService.updateStatus(parseInt(reservationId), status);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create: [hasOnlyValidProperties, 
           hasRequiredProperties, 
           validateDateTimePeople, 
           validateTargetDate,
           asyncErrorBoundary(create)],
  read: asyncErrorBoundary(read),
  update: asyncErrorBoundary(update)
};
