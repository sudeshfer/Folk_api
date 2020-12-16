"use strict";
//created by Hatem Suthura
const express = require("express");
const eventRouter = new express.Router();
const eventsController = require('../controller/eventController');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: 'uploads/users_posts_img',
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });


eventRouter.post("/create", upload.single('img'), eventsController.createEvent);
eventRouter.post("/update", upload.single('img'), eventsController.updateEvent);
eventRouter.post("/fetch", eventsController.getEvents);

eventRouter.post("/deleteEvent", eventsController.deleteEvent);

eventRouter.post("/joinevent", eventsController.joinEvent);
eventRouter.post("/getjoinedevents", eventsController.getJoinedEvents);
eventRouter.post("/leaveevent", eventsController.leaveEvent);
eventRouter.post("/getuserevents", eventsController.getUserEvents);
eventRouter.post("/geteventusers", eventsController.getEventUsers);


module.exports = eventRouter;