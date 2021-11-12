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
  "people",
  "status"
]


const hasOnlyValidProperties = (req, res, next) => {
  const { data = {} } = req.body;
  if (!data.status) data.status = "booked";
  const invalidFields = Object.keys(data).filter(entry => {
    return !VALID_PROPERTIES.includes(entry);
  })
  const invalidFieldsFilter = invalidFields.filter(field => {
    return field !== "reservation_id" && field !== "created_at" && field !== "updated_at";
  });
  if (invalidFieldsFilter.length) {
    next({
      status: 400,
      message: `Invalid Field(s) => ${invalidFieldsFilter.join(", ")}`
    })
  }
  res.locals.data = data;
  next();
}

const hasRequiredProperties = (req, res, next) => {
  try {
      VALID_PROPERTIES.forEach(prop => {
        if (!res.locals.data[prop]) {
          const error = new Error(`A ${prop} property is required`);
          error.status = 400;
          throw error;
        }
      })
      next();
  } catch (err) {
      next(err);
  }
}

const validateStatusProp = (req, res, next) => {
  if (res.locals.data.status === "seated") {
    next({
      status: 400,
      message: "reservation_status cannot be 'seated'"
    })
  }
  if (res.locals.data.status === "finished") {
    next({
      status: 400,
      message: "reservation_status cannot be 'finished'"
    })
  }
  next();
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
  const dateArr = date.split("-");
  const timeArr = time.split(":");
  const targetDate = new Date(dateArr[0], dateArr[1], dateArr[2], timeArr[0], timeArr[1], 0);
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

async function validateUpdate(req, res, next) {
  const { reservationId } = req.params;
  const { status } = req.body.data;
  const data = await reservationsService.read(parseInt(reservationId));
  //console.log(data);
  if (!data) {
    next({
      status: 404,
      message: `reservation_id ${reservationId} does not exist`
    })
  }
  if (data.status === "finished") {
    next({
      status: 400,
      message: "'finished' status cannot be updated"
    })
  }
  if (status === "unknown") {
    next({
      status: 400,
      message: "Reservation status 'unknown'"
    })
  }
  res.locals.reservation = data;
  res.locals.newStatus = status;
  next();
}

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  try {
    const data = await reservationsService.read(parseInt(reservationId));
    if (!data) {
      next({
        status: 404,
        message: 'Reservation does not exist'
      })
    }
  } catch (err) {
    next(err)
  }
  next();
}


async function list(req, res, next) {
  if (req.query.date) {
    //date case
    try { 
      const date = req.query.date;
      const data = await reservationsService.listByDate(date);
      if (data.length > 1) {
        const filteredDates = data.filter(res => {
          return res.status !== "finished"
        });
        const sortedByTime = filteredDates.sort((a,b) => {
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
  } else {
    //mobile_number case
    try {
      const mobile_number = req.query.mobile_number;
      const data = await reservationsService.search(mobile_number);
      if (data.length > 1) {
        res.json({ data: data })
      } else {
        res.json({ data })
      }
    } catch (err) {
      next(err);
    }
    
  }
}

async function create(req, res, next) {
  //res.locals.data.reservation_status = 'booked';
  try {
    const data = await reservationsService.create(res.locals.data);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function read(req, res, next) {
  //console.log(req.params.reservationId);
  const { reservationId } = req.params;
  try {
    const data = await reservationsService.read(parseInt(reservationId));
    res.json({ data })
  } catch(err) {
    next(err);
  }
}

async function update(req, res, next) {
  let reservationId = res.locals.reservation.reservation_id;
  let status = res.locals.newStatus;
  try {
    const data = await reservationsService.updateStatus(reservationId, status);
    res.json({ data: { status }});
  } catch (err) {
    next(err);
  }
}

async function updateReservation(req, res, next) {
  try {
    const data = await reservationsService.updateReservation(res.locals.data);
    res.json({ data: data })
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create: [hasOnlyValidProperties, 
           hasRequiredProperties,
           validateStatusProp, 
           validateDateTimePeople, 
           validateTargetDate,
           asyncErrorBoundary(create)],
  read: asyncErrorBoundary(read),
  update: [asyncErrorBoundary(validateUpdate), asyncErrorBoundary(update)],
  updateReservation: [asyncErrorBoundary(reservationExists), 
                      hasOnlyValidProperties,
                      hasRequiredProperties,
                      validateDateTimePeople,
                      validateTargetDate,
                      asyncErrorBoundary(updateReservation)]
};
