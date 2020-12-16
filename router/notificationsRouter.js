"use strict";
//created by Hatem Suthura
const express = require("express");
const notificationsRouter = new express.Router();
const notificationsController = require('../controller/notificationController');


notificationsRouter.post("/fetch_all", notificationsController.getNotifications);
notificationsRouter.post("/markasread", notificationsController.markasread);
notificationsRouter.post("/getcount", notificationsController.getcount);


module.exports = notificationsRouter;