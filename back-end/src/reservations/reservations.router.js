/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/").get(controller.list).post(controller.create);
router.route("/:reservationId").get(controller.read).put(controller.updateReservation);
router.route("/:reservationId/status").put(controller.update);

module.exports = router;
